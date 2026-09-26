import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, getAuthToken } from "./helpers.js";

describe("bd query param", () => {
  it("accepts the configured bd on public GETs", async () => {
    var res = await request(app).get("/api/MicroSaas/products?bd=don_pepito_web");
    expect(res.status).toBe(200);
  });

  it("accepts requests with no bd at all", async () => {
    var res = await request(app).get("/api/MicroSaas/categories");
    expect(res.status).toBe(200);
  });

  it("rejects an arbitrary bd value instead of accepting it blindly", async () => {
    var res = await request(app).get("/api/MicroSaas/products?bd=some_other_tenant");
    expect(res.status).toBe(400);
    expect(res.body.codResponse).toBe(0);
  });
});

describe("basic SQL injection resistance", () => {
  var token;
  var createdCategoryId;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  afterAll(async () => {
    if (createdCategoryId) {
      await request(app)
        .delete("/api/MicroSaas/categories/" + createdCategoryId)
        .set("Authorization", "Bearer " + token);
    }
  });

  it("stores an SQL-injection-looking name as a literal string without altering the schema", async () => {
    var payload = "Test'); DROP TABLE ven_category; --";

    var createRes = await request(app)
      .post("/api/MicroSaas/categories")
      .set("Authorization", "Bearer " + token)
      .send({ category_name: payload, category_status: 1 });

    expect(createRes.status).toBe(201);
    createdCategoryId = createRes.body.data[0].id_category;

    var listRes = await request(app).get("/api/MicroSaas/categories?bd=don_pepito_web");
    expect(listRes.status).toBe(200); // la tabla sigue existiendo

    var created = listRes.body.data.find(function (c) {
      return c.id_category === createdCategoryId;
    });
    expect(created.category_name).toBe(payload); // guardado tal cual, como dato
  });

  it("does not break out of the query via the login username field", async () => {
    var res = await request(app)
      .post("/api/Card/login")
      .send({ user: "' OR '1'='1", password: "' OR '1'='1" });

    expect(res.status).toBe(401); // ningún usuario coincide, no hay bypass
  });
});
