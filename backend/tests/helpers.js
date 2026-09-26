import request from "supertest";
import { createApp } from "../src/app.js";
import { ensureLocalDevUser, LOCAL_DEV_USER } from "../src/modules/auth/devUser.js";

export var app = createApp();

export async function getAuthToken() {
  var res;
  await ensureLocalDevUser();

  res = await request(app)
    .post("/api/Card/login")
    .send({ user: LOCAL_DEV_USER, password: process.env.LOCAL_DEV_PASSWORD });

  return res.body.token;
}
