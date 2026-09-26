import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, getAuthToken } from "./helpers.js";

describe("products", () => {
  var token;
  var categoryId;
  var productId;

  beforeAll(async () => {
    token = await getAuthToken();

    var catRes = await request(app)
      .post("/api/MicroSaas/categories")
      .set("Authorization", "Bearer " + token)
      .send({ category_name: "Products Test Category", category_status: 1 });
    categoryId = catRes.body.data[0].id_category;
  });

  afterAll(async () => {
    if (productId) {
      await request(app)
        .delete("/api/MicroSaas/products/" + productId)
        .set("Authorization", "Bearer " + token);
    }
    await request(app)
      .delete("/api/MicroSaas/categories/" + categoryId)
      .set("Authorization", "Bearer " + token);
  });

  it("GET /api/MicroSaas/products?bd=don_pepito_web returns the catalog without auth", async () => {
    var res = await request(app).get("/api/MicroSaas/products?bd=don_pepito_web");
    expect(res.status).toBe(200);
    expect(res.body.codResponse).toBe(1);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("category_name");
  });

  it("creates a product with has_price=false, normalizing price to 0", async () => {
    var res = await request(app)
      .post("/api/MicroSaas/products")
      .set("Authorization", "Bearer " + token)
      .send({
        idCategory: categoryId,
        productName: "Test Product",
        hasPrice: false,
        price: 999,
        productStatus: 1,
      });

    expect(res.status).toBe(201);
    productId = res.body.data[0].id_product;

    var listRes = await request(app).get("/api/MicroSaas/products?bd=don_pepito_web");
    var created = listRes.body.data.find(function (p) {
      return p.id_product === productId;
    });

    expect(created.has_price).toBe(0);
    expect(Number(created.price)).toBe(0);
    expect(created.product_status).toBe(1);
  });

  it("updates a product", async () => {
    var res = await request(app)
      .put("/api/MicroSaas/products/" + productId)
      .set("Authorization", "Bearer " + token)
      .send({
        idCategory: categoryId,
        productName: "Test Product Updated",
        hasPrice: true,
        price: 19.9,
        productStatus: 0,
      });

    expect(res.status).toBe(200);

    var listRes = await request(app).get("/api/MicroSaas/products?bd=don_pepito_web");
    var updated = listRes.body.data.find(function (p) {
      return p.id_product === productId;
    });

    expect(updated.product_name).toBe("Test Product Updated");
    expect(updated.has_price).toBe(1);
    expect(Number(updated.price)).toBe(19.9);
    expect(updated.product_status).toBe(0);
  });

  it("rejects creating a product with a non-existent category", async () => {
    var res = await request(app)
      .post("/api/MicroSaas/products")
      .set("Authorization", "Bearer " + token)
      .send({ idCategory: 999999, productName: "Orphan", hasPrice: false, price: 0, productStatus: 1 });

    expect(res.status).toBe(400);
    expect(res.body.codResponse).toBe(0);
  });

  it("rejects creating a product without a name", async () => {
    var res = await request(app)
      .post("/api/MicroSaas/products")
      .set("Authorization", "Bearer " + token)
      .send({ idCategory: categoryId, productName: "", hasPrice: false, price: 0, productStatus: 1 });

    expect(res.status).toBe(400);
  });
});
