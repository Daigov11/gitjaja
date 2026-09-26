import { createApp } from "./app.js";
import { env } from "./config/env.js";

var app = createApp();

app.listen(env.port, env.host, function () {
  console.log("Don Pepito backend escuchando en http://" + env.host + ":" + env.port);
});
