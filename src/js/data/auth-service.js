import { redirectByRole, redirectToLogin } from "./navigation.js";
import { clearAuthToken, getAuthToken } from "./auth-token.js";
import { loginWithCredentials, registerAccount } from "./http.js";

const SESSION_KEY = "zenify_session";

export function getSession() {
 return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function setSession(user) {
 localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
 localStorage.removeItem(SESSION_KEY);
 sessionStorage.removeItem("zenify_user");
 clearAuthToken();
}

function toSessionUser(user) {
 return {
  id: user.id,
  name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
  email: user.email,
  role: user.role,
 };
}

export async function loginUser({ email, password }) {
 try {
  const user = await loginWithCredentials(email, password);
  const session = toSessionUser(user);
  setSession(session);
  return { ok: true, session };
 } catch (error) {
  return {
   ok: false,
   message: error.message || "Credenciais inválidas.",
  };
 }
}

export async function registerUser({ name, email, password, role }) {
 if (role !== "user") {
  return {
   ok: false,
   message: "Não é permitido criar contas de administrador.",
  };
 }

 try {
  const created = await registerAccount({
   name: name.trim(),
   email: email.trim().toLowerCase(),
   password,
   role,
   createdAt: new Date().toISOString(),
  });

  return { ok: true, user: created };
 } catch (error) {
  return {
   ok: false,
   message: error.message || "Erro ao criar conta.",
  };
 }
}

export async function requireAuth(requiredRole) {
 const session = getSession();
 if (!session || !getAuthToken()) {
  redirectToLogin();
  return null;
 }
 if (requiredRole && session.role !== requiredRole) {
  redirectByRole(session.role);
  return null;
 }
 return session;
}
