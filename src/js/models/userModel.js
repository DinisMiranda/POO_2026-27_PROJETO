const API_BASE = "http://localhost:3000";

export const UserModel = {
 async register({ firstName, lastName, email, password, dob }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  const checkRes = await fetch(
   `${API_BASE}/users?email=${encodeURIComponent(normalizedEmail)}`,
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
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  // 1. Confirmar se o email existe
  const emailRes = await fetch(
   `${API_BASE}/users?email=${encodeURIComponent(normalizedEmail)}`,
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

  // 2. Confirmar password
  const matchedUser = usersByEmail.find(
   (user) => String(user.password).trim() === normalizedPassword,
  );

  if (!matchedUser) {
   throw new Error("A password está incorreta.");
  }

  const { password: _pw, ...safeUser } = matchedUser;
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
