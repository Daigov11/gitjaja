import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "./helpers.js";
import { LOCAL_DEV_USER, ensureLocalDevUser } from "../src/modules/auth/devUser.js";

describe("POST /api/Card/login", () => {
  it("logs in with valid credentials and returns a real JWT", async () => {
    await ensureLocalDevUser();

    var res = await request(app)
      .post("/api/Card/login")
      .send({ bd: "don_pepito_web", user: LOCAL_DEV_USER, password: process.env.LOCAL_DEV_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.codResponse).toBe(1);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.split(".")).toHaveLength(3); // header.payload.signature
    expect(res.body.data[0].usuario).toBe(LOCAL_DEV_USER);
  });

  it("rejects an invalid password without revealing which field was wrong", async () => {
    var res = await request(app)
      .post("/api/Card/login")
      .send({ user: LOCAL_DEV_USER, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.codResponse).toBe(0);
    expect(res.body.token).toBeUndefined();
  });

  it("rejects an unknown user with the same generic message", async () => {
    var res = await request(app)
      .post("/api/Card/login")
      .send({ user: "nobody@nowhere.test", password: "whatever" });

    expect(res.status).toBe(401);
    expect(res.body.codResponse).toBe(0);
  });

  it("rejects a login missing required fields", async () => {
    var res = await request(app).post("/api/Card/login").send({ user: "" });
    expect(res.status).toBe(400);
  });
});

describe("mutations without a token", () => {
  it("returns 401 for POST /api/MicroSaas/products", async () => {
    var res = await request(app).post("/api/MicroSaas/products").send({ productName: "x" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for POST /api/MicroSaas/categories", async () => {
    var res = await request(app).post("/api/MicroSaas/categories").send({ categoryName: "x" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for POST /api/Data/images", async () => {
    var res = await request(app).post("/api/Data/images");
    expect(res.status).toBe(401);
  });
});
