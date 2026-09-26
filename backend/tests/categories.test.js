import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, getAuthToken } from "./helpers.js";

describe("categories", () => {
  var token;
  var createdId;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  it("GET /api/MicroSaas/categories?bd=don_pepito_web returns the catalog without auth", async () => {
    var res = await request(app).get("/api/MicroSaas/categories?bd=don_pepito_web");
    expect(res.status).toBe(200);
    expect(res.body.codResponse).toBe(1);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("creates, updates and deletes a category (full CRUD)", async () => {
    var createRes = await request(app)
      .post("/api/MicroSaas/categories")
      .set("Authorization", "Bearer " + token)
      .send({ category_name: "Test CRUD", category_desc: "temp", category_status: 1 });

    expect(createRes.status).toBe(201);
    createdId = createRes.body.data[0].id_category;
    expect(createdId).toBeTruthy();

    var updateRes = await request(app)
      .put("/api/MicroSaas/categories/" + createdId)
      .set("Authorization", "Bearer " + token)
      .send({ category_name: "Test CRUD Updated", category_status: 0 });

    expect(updateRes.status).toBe(200);

    var listRes = await request(app).get("/api/MicroSaas/categories?bd=don_pepito_web");
    var updated = listRes.body.data.find(function (c) {
      return c.id_category === createdId;
    });
    expect(updated.category_name).toBe("Test CRUD Updated");
    expect(updated.category_status).toBe(0);

    var deleteRes = await request(app)
      .delete("/api/MicroSaas/categories/" + createdId)
      .set("Authorization", "Bearer " + token);
    expect(deleteRes.status).toBe(200);
    createdId = null;
  });

  it("returns 409 when deleting a category that still has products", async () => {
    var catRes = await request(app)
      .post("/api/MicroSaas/categories")
      .set("Authorization", "Bearer " + token)
      .send({ category_name: "Test With Product", category_status: 1 });
    var categoryId = catRes.body.data[0].id_category;

    var prodRes = await request(app)
      .post("/api/MicroSaas/products")
      .set("Authorization", "Bearer " + token)
      .send({ idCategory: categoryId, productName: "Temp product", hasPrice: false, price: 0, productStatus: 1 });
    var productId = prodRes.body.data[0].id_product;

    var deleteRes = await request(app)
      .delete("/api/MicroSaas/categories/" + categoryId)
      .set("Authorization", "Bearer " + token);

    expect(deleteRes.status).toBe(409);
    expect(deleteRes.body.codResponse).toBe(0);

    // cleanup: borrar el producto primero y luego sí la categoría
    await request(app)
      .delete("/api/MicroSaas/products/" + productId)
      .set("Authorization", "Bearer " + token);
    await request(app)
      .delete("/api/MicroSaas/categories/" + categoryId)
      .set("Authorization", "Bearer " + token);
  });

  it("rejects an invalid ?bd= value", async () => {
    var res = await request(app).get("/api/MicroSaas/categories?bd=some_other_db");
    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    if (createdId) {
      await request(app)
        .delete("/api/MicroSaas/categories/" + createdId)
        .set("Authorization", "Bearer " + token);
    }
  });
});
