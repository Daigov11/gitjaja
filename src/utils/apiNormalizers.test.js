import { describe, expect, it } from "vitest";
import {
  toBoolean,
  normalizeProduct,
  normalizeCategory,
  toProductApiBody,
  toCategoryApiBody,
} from "./apiNormalizers";

describe("toBoolean", () => {
  it("treats 1, '1' and true as true", () => {
    expect(toBoolean(1)).toBe(true);
    expect(toBoolean("1")).toBe(true);
    expect(toBoolean(true)).toBe(true);
  });

  it("treats 0, '0', false, null, undefined and '' as false", () => {
    expect(toBoolean(0)).toBe(false);
    expect(toBoolean("0")).toBe(false);
    expect(toBoolean(false)).toBe(false);
    expect(toBoolean(null)).toBe(false);
    expect(toBoolean(undefined)).toBe(false);
    expect(toBoolean("")).toBe(false);
  });
});

describe("normalizeProduct", () => {
  it("normalizes a product with string '0' flags as inactive/no price", () => {
    var product = normalizeProduct({
      id_product: 5,
      product_status: "0",
      has_price: "0",
      price: "12.50",
    });

    expect(product.product_status).toBe(false);
    expect(product.has_price).toBe(false);
    expect(product.price).toBe(12.5);
  });

  it("accepts camelCase fields from the API", () => {
    var product = normalizeProduct({
      idCategory: "3",
      productName: "Harina",
      productStatus: 1,
      hasPrice: "1",
    });

    expect(product.id_category).toBe(3);
    expect(product.product_name).toBe("Harina");
    expect(product.product_status).toBe(true);
    expect(product.has_price).toBe(true);
  });

  it("keeps null image/url fields as null, never empty-string-as-truthy", () => {
    var product = normalizeProduct({ product_image_url: "" });
    expect(product.product_image_url).toBeNull();
  });
});

describe("normalizeCategory", () => {
  it("normalizes '0' category_status to false and merges image url variants", () => {
    var category = normalizeCategory({
      category_status: "0",
      categoryImageUrl: "https://example.com/a.png",
    });

    expect(category.category_status).toBe(false);
    expect(category.category_image_url).toBe("https://example.com/a.png");
  });
});

describe("toProductApiBody", () => {
  it("sends price 0 and hasPrice 0 when has_price is false", () => {
    var body = toProductApiBody({ has_price: false, price: 99, id_category: 2 });
    expect(body.hasPrice).toBe(0);
    expect(body.price).toBe(0);
    expect(body.idCategory).toBe(2);
  });

  it("sends the numeric price when has_price is true", () => {
    var body = toProductApiBody({ has_price: true, price: "15.5" });
    expect(body.hasPrice).toBe(1);
    expect(body.price).toBe(15.5);
  });
});

describe("toCategoryApiBody", () => {
  it("mirrors the image url into both camelCase and snake_case keys", () => {
    var body = toCategoryApiBody({ category_image_url: "https://example.com/c.png", category_status: 1 });
    expect(body.categoryImageUrl).toBe("https://example.com/c.png");
    expect(body.category_image_url).toBe("https://example.com/c.png");
    expect(body.categoryStatus).toBe(1);
  });
});
