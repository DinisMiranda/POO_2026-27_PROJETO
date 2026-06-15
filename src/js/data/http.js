import { API } from "./config.js";
import {
 getAuthToken,
 parseAuthToken,
 setAuthToken,
} from "./auth-token.js";

export async function apiFetchJson(path, options = {}) {
 const res = await apiFetch(path, options);
 if (!res?.ok) throw new Error(`Pedido falhou: ${path}`);
 return res.json();
}

export async function apiFetch(path, options = {}) {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 2500);
 const headers = new Headers(options.headers || {});
 const token = getAuthToken();

 if (token && !headers.has("Authorization")) {
  headers.set("Authorization", `Bearer ${token}`);
 }

 try {
  const response = await fetch(`${API}${path}`, {
   ...options,
   headers,
   signal: controller.signal,
  });
  return response;
 } catch {
  return null;
 } finally {
  clearTimeout(timeout);
 }
}

async function fetchUserProfile(userId) {
 return apiFetchJson(`/users/${userId}`);
}

function userFromAuthResponse({ accessToken, user }) {
 if (!accessToken) {
  throw new Error("Resposta de autenticação inválida.");
 }

 setAuthToken(accessToken);

 if (user?.id) {
  const { password: _pw, ...safeUser } = user;
  return safeUser;
 }

 const claims = parseAuthToken(accessToken);
 if (!claims?.id) {
  throw new Error("Resposta de autenticação inválida.");
 }

 return fetchUserProfile(claims.id);
}

export async function loginWithCredentials(email, password) {
 const normalizedEmail = email.trim().toLowerCase();
 const normalizedPassword = password.trim();

 const res = await fetch(`${API}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   email: normalizedEmail,
   password: normalizedPassword,
  }),
 });

 if (!res.ok) {
  throw new Error("Email ou palavra-passe incorretos.");
 }

 return userFromAuthResponse(await res.json());
}

export async function registerAccount(payload) {
 const res = await fetch(`${API}/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
 });

 if (!res.ok) {
  if (res.status === 400) {
   throw new Error("Este email já está registado.");
  }
  throw new Error("Erro ao criar conta. Tenta novamente.");
 }

 return userFromAuthResponse(await res.json());
}
