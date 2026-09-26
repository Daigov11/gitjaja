import { afterEach, describe, expect, it } from "vitest";
import { ensureLocalDevUser } from "../src/modules/auth/devUser.js";

var originalPassword = process.env.LOCAL_DEV_PASSWORD;
var originalNodeEnv = process.env.NODE_ENV;

describe("ensureLocalDevUser guards", () => {
  afterEach(() => {
    process.env.LOCAL_DEV_PASSWORD = originalPassword;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("fails with a clear message when LOCAL_DEV_PASSWORD is missing", async () => {
    delete process.env.LOCAL_DEV_PASSWORD;
    await expect(ensureLocalDevUser()).rejects.toThrow(/LOCAL_DEV_PASSWORD/);
  });

  it("refuses to run when NODE_ENV=production, even with a password set", async () => {
    process.env.LOCAL_DEV_PASSWORD = "whatever";
    process.env.NODE_ENV = "production";
    await expect(ensureLocalDevUser()).rejects.toThrow(/production/);
  });
});
