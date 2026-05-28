import { redirectByRole, redirectToLogin } from "./navigation.js";

const USERS_KEY = "zenify_users";
const SESSION_KEY = "zenify_session";

const seedUsers = [
  { id: 1, name: "Administrador", email: "admin@zenify.local", password: "admin123", role: "admin" },
];

function readUsers() {
  const saved = localStorage.getItem(USERS_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
  return seedUsers;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function registerUser({ name, email, password, role }) {
  if (role !== "user") {
    return { ok: false, message: "Nao e permitido criar contas de administrador." };
  }

  const users = readUsers();
  const alreadyExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) return { ok: false, message: "Ja existe uma conta com este email." };

  const user = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  };
  users.push(user);
  writeUsers(users);
  return { ok: true, user };
}

export function loginUser({ email, password }) {
  const users = readUsers();
  const match = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
  if (!match) return { ok: false, message: "Credenciais invalidas." };

  const session = { id: match.id, name: match.name, email: match.email, role: match.role };
  setSession(session);
  return { ok: true, session };
}

export function requireAuth(requiredRole) {
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
