import { afterEach, describe, expect, it } from "vitest";
import { addAuthAndBdParams, handleResponseError } from "./apiClient";
import { setToken, getUser, AUTH_TOKEN_KEY } from "../state/auth";

describe("addAuthAndBdParams", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("does not add an Authorization header when there is no real token", () => {
    var config = addAuthAndBdParams({ url: "/MicroSaas/products", headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it("adds 'Bearer <token>' only when a real token exists", () => {
    setToken("abc123");
    var config = addAuthAndBdParams({ url: "/MicroSaas/products", headers: {} });
    expect(config.headers.Authorization).toBe("Bearer abc123");
  });

  it("injects bd only for /MicroSaas/ endpoints", () => {
    var withBd = addAuthAndBdParams({ url: "/MicroSaas/categories", headers: {} });
    expect(withBd.params.bd).toBeTruthy();

    var withoutBd = addAuthAndBdParams({ url: "/Card/login", headers: {} });
    expect(withoutBd.params).toBeUndefined();
  });
});

describe("handleResponseError", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("clears the session on a 401 response", async () => {
    setToken("abc123");
    await expect(
      handleResponseError({ response: { status: 401 } })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(getUser()).toBeNull();
  });

  it("leaves the session untouched for non-401 errors", async () => {
    setToken("abc123");
    await expect(
      handleResponseError({ response: { status: 500 } })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("abc123");
  });
});
