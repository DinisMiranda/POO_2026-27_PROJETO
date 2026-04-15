const AUTH_KEYS = {
  users: "zenify_users",
  session: "zenify_session",
};

function getUsers() {
  const saved = localStorage.getItem(AUTH_KEYS.users);
  if (saved) return JSON.parse(saved);

  const seedUsers = [
    { id: 1, name: "Administrador", email: "admin@zenify.local", password: "admin123", role: "admin" },
  ];
  localStorage.setItem(AUTH_KEYS.users, JSON.stringify(seedUsers));
  return seedUsers;
}

function setUsers(users) {
  localStorage.setItem(AUTH_KEYS.users, JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem(AUTH_KEYS.session) || "null");
}

function setSession(user) {
  localStorage.setItem(AUTH_KEYS.session, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEYS.session);
}

function registerUser({ name, email, password, role }) {
  const users = getUsers();
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
  setUsers(users);
  return { ok: true, user };
}

function loginUser({ email, password }) {
  const users = getUsers();
  const match = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
  if (!match) return { ok: false, message: "Credenciais invalidas." };

  const session = { id: match.id, name: match.name, email: match.email, role: match.role };
  setSession(session);
  return { ok: true, session };
}

function requireAuth(requiredRole) {
  const session = getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  if (requiredRole && session.role !== requiredRole) {
    window.location.href = session.role === "admin" ? "admin.html" : "app.html";
    return null;
  }

  return session;
}
