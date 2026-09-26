import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("builds the same key for admin and public consumers of the same entity", () => {
    expect(queryKeys.products("bd1")).toEqual(["products", "bd1"]);
    expect(queryKeys.categories("bd1")).toEqual(["categories", "bd1"]);
  });

  it("falls back to the default BD when none is given", () => {
    var [, bd] = queryKeys.products();
    expect(bd).toBeTruthy();
  });
});

describe("cache invalidation across admin/public views", () => {
  it("invalidating the shared products key triggers a refetch for every observer", async () => {
    var qc = new QueryClient({
      defaultOptions: { queries: { staleTime: 60000 } },
    });
    var fetchProducts = vi.fn().mockResolvedValue({ codResponse: "1", data: [] });

    // Dos "vistas" (admin y pública) observando la misma entidad.
    await qc.fetchQuery({ queryKey: queryKeys.products("bd1"), queryFn: fetchProducts });
    await qc.fetchQuery({ queryKey: queryKeys.products("bd1"), queryFn: fetchProducts });
    expect(fetchProducts).toHaveBeenCalledTimes(1); // misma key = cache compartida

    await qc.invalidateQueries({ queryKey: queryKeys.products("bd1") });
    await qc.fetchQuery({ queryKey: queryKeys.products("bd1"), queryFn: fetchProducts });
    expect(fetchProducts).toHaveBeenCalledTimes(2); // invalidada -> refetch
  });
});
