import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, getAuthToken } from "./helpers.js";
import { uploadDir } from "../src/modules/images/images.upload.js";
import { tinyPng } from "./fixtures.js";

describe("POST /api/Data/images", () => {
  var token;
  var uploadedFiles = [];

  beforeAll(async () => {
    token = await getAuthToken();
  });

  afterAll(() => {
    uploadedFiles.forEach(function (name) {
      var full = uploadDir + "/" + name;
      if (fs.existsSync(full)) fs.unlinkSync(full);
    });
  });

  it("uploads a valid PNG, stores it under a UUID name and serves it statically", async () => {
    var res = await request(app)
      .post("/api/Data/images")
      .set("Authorization", "Bearer " + token)
      .attach("image", tinyPng(), { filename: "my original name.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.codResponse).toBe(1);
    expect(res.body.archivo).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(res.body.archivo).not.toContain("my original name");
    uploadedFiles.push(res.body.archivo);

    var getRes = await request(app).get("/images/" + res.body.archivo);
    expect(getRes.status).toBe(200);
    expect(getRes.headers["content-type"]).toContain("image/png");
  });

  it("rejects a disallowed mime type", async () => {
    var res = await request(app)
      .post("/api/Data/images")
      .set("Authorization", "Bearer " + token)
      .attach("image", Buffer.from("hello"), { filename: "file.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
    expect(res.body.codResponse).toBe(0);
  });

  it("rejects a file over the 2MB limit", async () => {
    var big = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(3 * 1024 * 1024)]);

    var res = await request(app)
      .post("/api/Data/images")
      .set("Authorization", "Bearer " + token)
      .attach("image", big, { filename: "big.png", contentType: "image/png" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/2 ?MB/i);
  });

  it("returns 404 for a path-traversal attempt instead of leaking files", async () => {
    var res = await request(app).get("/images/..%2f..%2f..%2fetc%2fpasswd");
    expect([400, 404]).toContain(res.status);
  });
});
