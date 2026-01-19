import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiClient";
import { setToken, setUser } from "../state/auth";

export default function Login() {
  var navigate;
  var user, setUserInput;
  var password, setPassword;
  var loading, setLoading;
  var error, setError;

  var BD_FIXED;

  navigate = useNavigate();
  BD_FIXED = "don_pepito_web";

  user = useState("");
  setUserInput = user[1];
  user = user[0];

  password = useState("");
  setPassword = password[1];
  password = password[0];

  loading = useState(false);
  setLoading = loading[1];
  loading = loading[0];

  error = useState("");
  setError = error[1];
  error = error[0];

  async function onSubmit(e) {
    var res, data, payload, ok, userObj, fakeToken;

    e.preventDefault();
    setError("");
    setLoading(true);

    payload = { bd: BD_FIXED, user: user, password: password };

    try {
      res = await api.post(
        "https://api-centralizador.apiworking.pe/api/Card/login",
        payload,
        { headers: { accept: "*/*", "Content-Type": "application/json" } }
      );

      data = res && res.data ? res.data : null;

      // OK si codResponse == "1"
      ok = data && (data.codResponse === "1" || data.codResponse === 1);

      if (!ok) {
        setError((data && data.message) || "Login falló");
        setLoading(false);
        return;
      }

      // toma el usuario del array data[0]
      userObj =
        (data && data.data && data.data[0]) || { usuario: user, bd: BD_FIXED };

      // como no hay token real, generamos uno local para el guard
      fakeToken = "erp-session-" + String(userObj.id_usuario || "0") + "-" + Date.now();

      setToken(fakeToken);
      setUser(userObj);

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        (err && err.response && err.response.data && err.response.data.message) ||
          (err && err.message) ||
          "Login falló"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: 16 }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Usuario / Email"
          value={user}
          onChange={function (e) {
            setUserInput(e.target.value);
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={function (e) {
            setPassword(e.target.value);
          }}
        />

        <button disabled={loading}>
          {loading ? "entrando al maravilloso mundo donde el lapiz no se cayó..." : "Entrar"}
        </button>

        {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
      </form>
    </div>
  );
}
