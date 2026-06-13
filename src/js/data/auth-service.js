import { redirectByRole, redirectToLogin } from "./navigation.js";
import { API } from "./config.js";

const SESSION_KEY = "zenify_session";

export function getSession() {
 return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function setSession(user) {
 localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
 localStorage.removeItem(SESSION_KEY);
}

export async function loginUser({ email, password }) {
 const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
 if (!res.ok) throw new Error("Erro ao contactar o servidor.");
 const users = await res.json();
 const match = users.find(
  (u) =>
   u.email.toLowerCase() === email.toLowerCase() && u.password === password,
 );
 if (!match) return { ok: false, message: "Credenciais inválidas." };
 const session = {
  id: match.id,
  name: match.name ?? `${match.firstName ?? ""} ${match.lastName ?? ""}`.trim(),
  email: match.email,
  role: match.role,
 };
 setSession(session);
 return { ok: true, session };
}

export async function registerUser({ name, email, password, role }) {
 if (role !== "user") {
  return {
   ok: false,
   message: "Não é permitido criar contas de administrador.",
  };
 }

 const checkRes = await fetch(
  `${API}/users?email=${encodeURIComponent(email)}`,
 );
 const existing = await checkRes.json();
 if (existing.length > 0) {
  return { ok: false, message: "Já existe uma conta com este email." };
 }

 const newUser = {
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
  role,
  createdAt: new Date().toISOString(),
 };

 const createRes = await fetch(`${API}/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newUser),
 });
 if (!createRes.ok) throw new Error("Erro ao criar conta.");
 const created = await createRes.json();
 return { ok: true, user: created };
}

export async function requireAuth(requiredRole) {
 const session = getSession();
 if (!session) {
  redirectToLogin();
  return null;
 }
 if (requiredRole && session.role !== requiredRole) {
  redirectByRole(session.role);
  return null;
 }
 return session;
}
