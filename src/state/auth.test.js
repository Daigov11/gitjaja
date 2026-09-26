import { afterEach, describe, expect, it } from "vitest";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuth,
  getToken,
  getUser,
  isAuthed,
  isValidSession,
  setToken,
  setUser,
} from "./auth";

describe("auth state", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("has no token by default and isAuthed is false", () => {
    expect(getToken()).toBe("");
    expect(isAuthed()).toBe(false);
  });

  it("persists and clears the session", () => {
    setUser({ usuario: "admin" });
    expect(isAuthed()).toBe(true);

    clearAuth();
    expect(getUser()).toBeNull();
    expect(isAuthed()).toBe(false);
  });

  it("treats a session object without any user identifier as invalid", () => {
    expect(isValidSession({})).toBe(false);
    expect(isValidSession(null)).toBe(false);
    expect(isValidSession({ usuario: "x" })).toBe(true);
  });

  it("survives a corrupted value in localStorage without throwing", () => {
    localStorage.setItem(AUTH_USER_KEY, "not-json{{");
    expect(getUser()).toBeNull();
    expect(isAuthed()).toBe(false);
  });

  it("only sets a token when explicitly asked (no fake tokens by default)", () => {
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    setToken("real-token-from-backend");
    expect(getToken()).toBe("real-token-from-backend");
  });
});
