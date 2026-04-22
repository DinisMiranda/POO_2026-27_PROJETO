class AuthModel {
  constructor() {
    this.AUTH_KEYS = {
      users: "zenify_users",
      session: "zenify_session",
    };
  }

  getUsers() {
    const saved = localStorage.getItem(this.AUTH_KEYS.users);
    if (saved) return JSON.parse(saved);

    const seedUsers = [{ id: 1, name: "Administrador", email: "admin@zenify.local", password: "admin123", role: "admin" }];
    localStorage.setItem(this.AUTH_KEYS.users, JSON.stringify(seedUsers));
    return seedUsers;
  }

  setUsers(users) {
    localStorage.setItem(this.AUTH_KEYS.users, JSON.stringify(users));
  }

  getSession() {
    return JSON.parse(localStorage.getItem(this.AUTH_KEYS.session) || "null");
  }

  setSession(user) {
    localStorage.setItem(this.AUTH_KEYS.session, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(this.AUTH_KEYS.session);
  }

  registerUser({ name, email, password, role }) {
    if (role !== "user") {
      return { ok: false, message: "Nao e permitido criar contas de administrador." };
    }

    const users = this.getUsers();
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
    this.setUsers(users);
    return { ok: true, user };
  }

  loginUser({ email, password }) {
    const users = this.getUsers();
    const match = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
    if (!match) return { ok: false, message: "Credenciais invalidas." };

    const session = { id: match.id, name: match.name, email: match.email, role: match.role };
    this.setSession(session);
    return { ok: true, session };
  }

  requireAuth(requiredRole) {
    const session = this.getSession();
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
}
