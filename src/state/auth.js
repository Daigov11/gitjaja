var AUTH_TOKEN_KEY, AUTH_USER_KEY;

AUTH_TOKEN_KEY = "erp_token";
AUTH_USER_KEY = "erp_user";

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

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
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || null));
}

export function isAuthed() {
  return !!getToken();
}
