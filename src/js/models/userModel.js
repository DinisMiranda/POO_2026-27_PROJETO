const API_BASE = "http://localhost:3000";

export const UserModel = {
 async register({ firstName, lastName, email, password, dob }) {
  const checkRes = await fetch(
   `${API_BASE}/users?email=${encodeURIComponent(email)}`,
  );

  if (!checkRes.ok) {
   throw new Error("Erro ao verificar o email.");
  }

  const existing = await checkRes.json();

  if (existing.length > 0) {
   throw new Error("Este email já está registado.");
  }

  const payload = {
   firstName,
   lastName,
   name: `${firstName} ${lastName}`.trim(),
   email,
   password,
   dob,
   role: "user",
   xp: 0,
   streak: 0,
   badges: [],
   createdAt: new Date().toISOString(),
  };

  const res = await fetch(`${API_BASE}/users`, {
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
  const res = await fetch(
   `${API_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  );

  if (!res.ok) {
   throw new Error("Erro ao comunicar com o servidor.");
  }

  const users = await res.json();

  if (users.length === 0) {
   throw new Error("Email ou password incorretos.");
  }

  const { password: _pw, ...safeUser } = users[0];
  return safeUser;
 },

 saveSession(user) {
  sessionStorage.setItem("zenify_user", JSON.stringify(user));
 },

 getSession() {
  try {
   const raw = sessionStorage.getItem("zenify_user");
   return raw ? JSON.parse(raw) : null;
  } catch {
   return null;
  }
 },

 clearSession() {
  sessionStorage.removeItem("zenify_user");
 },
};
