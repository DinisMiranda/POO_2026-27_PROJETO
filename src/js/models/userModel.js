import { API } from "../data/config.js";

const SESSION_KEY = "zenify_user";
const LEGACY_SESSION_KEY = "zenify_session";

function toSafeUser(user) {
 if (!user) return null;
 const { password: _pw, ...safeUser } = user;
 return safeUser;
}

export const UserModel = {
 async register({ firstName, lastName, email, password, dob }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  const checkRes = await fetch(
   `${API}/users?email=${encodeURIComponent(normalizedEmail)}`,
  );

  if (!checkRes.ok) {
   throw new Error("Erro ao verificar o email.");
  }

  const existing = await checkRes.json();

  if (existing.length > 0) {
   throw new Error("Este email já está registado.");
  }

  const payload = {
   firstName: firstName.trim(),
   lastName: lastName.trim(),
   name: `${firstName} ${lastName}`.trim(),
   email: normalizedEmail,
   password: normalizedPassword,
   dob,
   role: "user",
   xp: 0,
   streak: 0,
   badges: [],
   createdAt: new Date().toISOString(),
  };

  const res = await fetch(`${API}/users`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });

  if (!res.ok) {
   throw new Error("Erro ao criar conta. Tenta novamente.");
  }

  return await res.json();
 },

 async login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  const emailRes = await fetch(
   `${API}/users?email=${encodeURIComponent(normalizedEmail)}`,
  );

  if (!emailRes.ok) {
   throw new Error(
    "Load fail: não foi possível validar o email na base de dados.",
   );
  }

  const usersByEmail = await emailRes.json();

  if (usersByEmail.length === 0) {
   throw new Error("Este email não existe na base de dados.");
  }

  const matchedUser = usersByEmail.find(
   (user) => String(user.password).trim() === normalizedPassword,
  );

  if (!matchedUser) {
   throw new Error("A password está incorreta.");
  }

  return toSafeUser(matchedUser);
 },

 saveSession(user) {
  const safeUser = toSafeUser(user);
  if (!safeUser) return;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  localStorage.setItem(
   LEGACY_SESSION_KEY,
   JSON.stringify({
    id: safeUser.id,
    name:
     safeUser.name ||
     `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim(),
    email: safeUser.email,
    role: safeUser.role,
   }),
  );
 },

 getSession() {
  try {
   const raw = sessionStorage.getItem(SESSION_KEY);
   if (raw) return JSON.parse(raw);

   const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
   return legacy ? JSON.parse(legacy) : null;
  } catch {
   return null;
  }
 },

 clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
 },

 /** Garante que a sessão tem dados sincronizados com a db. */
 async resolveSession() {
  const session = this.getSession();
  if (!session?.email) return session;

  try {
   const res = await fetch(
    `${API}/users?email=${encodeURIComponent(session.email)}`,
   );
   if (!res.ok) return session;

   const users = await res.json();
   const match = users.find(
    (u) => u.email.toLowerCase() === session.email.toLowerCase(),
   );
   if (!match) return session;

   const safeUser = toSafeUser(match);
   this.saveSession({ ...session, ...safeUser });
   return safeUser;
  } catch {
   return session;
  }
 },
};
