// Única fuente de las claves de sesión en localStorage. apiClient.js y
// cualquier otro módulo deben importar estas claves en vez de repetirlas.
export var AUTH_TOKEN_KEY = "erp_token";
export var AUTH_USER_KEY = "erp_user";

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

// El backend actual no emite token: esto solo existe para el día en que sí
// lo haga. No se debe llamar con un valor inventado.
export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token || "");
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getUser() {
  var raw;
  raw = localStorage.getItem(AUTH_USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || null));
}

// Un objeto de sesión válido debe traer al menos un identificador de usuario.
// Esto evita que un valor corrupto o parcial en localStorage (p. ej. "{}" o
// "null" ya parseado) se interprete como sesión activa.
export function isValidSession(user) {
  if (!user || typeof user !== "object") return false;
  return Boolean(user.usuario || user.user || user.email);
}

export function isAuthed() {
  return isValidSession(getUser());
}
