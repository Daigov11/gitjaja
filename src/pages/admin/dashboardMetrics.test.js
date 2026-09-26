import { describe, expect, it } from "vitest";
import { countActive, countWithoutPrice } from "./dashboardMetrics";

var PRODUCTS = [
  { product_status: "1", has_price: "1" },
  { product_status: "0", has_price: "1" },
  { product_status: 1, has_price: "0" },
  { product_status: 0, has_price: 0 },
];

describe("dashboard metrics", () => {
  it("counts active products treating '0' as inactive", () => {
    expect(countActive(PRODUCTS)).toBe(2);
  });

  it("counts products without price treating '0' as no price", () => {
    expect(countWithoutPrice(PRODUCTS)).toBe(2);
  });

  it("returns 0 for an empty list", () => {
    expect(countActive([])).toBe(0);
    expect(countWithoutPrice([])).toBe(0);
  });
});
