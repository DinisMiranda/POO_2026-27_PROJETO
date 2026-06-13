/* ================================================================
   auth.js — Lógica de autenticação (login + registo)
   Usa json-server: npx json-server --watch db.json --port 3000
   ================================================================ */

const API = "http://localhost:3000";

/* ────────────────────────────────────────
   Sessão em memória (window.__session)
   Partilhada entre páginas na mesma aba.
   ──────────────────────────────────────── */
function saveSession(user) {
 window.__session = {
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  initials: getInitials(user.firstName, user.lastName),
 };
}

function getInitials(first, last) {
 return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

/* ────────────────────────────────────────
   Trocar tab (Login ↔ Registo)
   ──────────────────────────────────────── */
function switchTab(tab) {
 document.querySelectorAll(".auth-tab").forEach((t) => {
  t.classList.remove("active");
  t.setAttribute("aria-selected", "false");
 });
 document
  .querySelectorAll(".auth-form")
  .forEach((f) => f.classList.remove("visible"));

 document.getElementById("tab-" + tab).classList.add("active");
 document.getElementById("tab-" + tab).setAttribute("aria-selected", "true");
 document.getElementById("form-" + tab).classList.add("visible");
 clearFeedback();
}

/* ────────────────────────────────────────
   Utilitários de UI
   ──────────────────────────────────────── */
function clearFeedback() {
 document.querySelectorAll(".form-feedback").forEach((el) => {
  el.className = "form-feedback";
  el.textContent = "";
 });
 document
  .querySelectorAll(".field-error")
  .forEach((el) => el.classList.remove("show"));
 document
  .querySelectorAll("input")
  .forEach((el) => el.classList.remove("error-input"));
}

function showFeedback(id, msg, type) {
 const el = document.getElementById(id);
 el.textContent = msg;
 el.className = "form-feedback " + type;
}

function fieldError(inputId, errId) {
 document.getElementById(inputId).classList.add("error-input");
 document.getElementById(errId).classList.add("show");
}

/* ────────────────────────────────────────
   LOGIN
   Fluxo:
   1. Validar campos no browser
   2. GET /users?email=x → json-server filtra pelo email
   3. Verificar password localmente
   4. Guardar sessão e redirecionar
   ──────────────────────────────────────── */
async function handleLogin(e) {
 e.preventDefault();
 clearFeedback();

 const email = document.getElementById("login-email").value.trim();
 const password = document.getElementById("login-password").value;
 let valid = true;

 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fieldError("login-email", "login-email-err");
  valid = false;
 }
 if (!password) {
  fieldError("login-password", "login-pass-err");
  valid = false;
 }
 if (!valid) return;

 const btn = document.getElementById("login-btn");
 btn.disabled = true;
 btn.textContent = "A entrar…";

 try {
  // Pede ao json-server os utilizadores com este email
  const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
  const users = await res.json();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
   showFeedback("login-feedback", "Email ou password incorretos.", "error");
   btn.disabled = false;
   btn.textContent = "Entrar";
   return;
  }

  saveSession(user);
  showFeedback(
   "login-feedback",
   "Login com sucesso! A redirecionar…",
   "success",
  );

  setTimeout(() => {
   window.location.href =
    user.role === "admin" ? "./admin.html" : "./dashboard.html";
  }, 800);
 } catch (err) {
  showFeedback(
   "login-feedback",
   "Não foi possível ligar ao servidor. Verifica se o json-server está ativo (npm start).",
   "error",
  );
  btn.disabled = false;
  btn.textContent = "Entrar";
 }
}

/* ────────────────────────────────────────
   REGISTO
   Fluxo:
   1. Validar campos no browser
   2. GET /users?email=x → verificar se já existe
   3. POST /users → json-server guarda o novo utilizador no db.json
   4. Guardar sessão e redirecionar para dashboard
   ──────────────────────────────────────── */
async function handleRegister(e) {
 e.preventDefault();
 clearFeedback();

 const firstName = document.getElementById("reg-firstname").value.trim();
 const lastName = document.getElementById("reg-lastname").value.trim();
 const email = document.getElementById("reg-email").value.trim();
 const password = document.getElementById("reg-password").value;
 let valid = true;

 if (!firstName) {
  fieldError("reg-firstname", "reg-firstname-err");
  valid = false;
 }
 if (!lastName) {
  fieldError("reg-lastname", "reg-lastname-err");
  valid = false;
 }
 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fieldError("reg-email", "reg-email-err");
  valid = false;
 }
 if (!password || password.length < 6) {
  fieldError("reg-password", "reg-pass-err");
  valid = false;
 }
 if (!valid) return;

 const btn = document.getElementById("register-btn");
 btn.disabled = true;
 btn.textContent = "A criar conta…";

 try {
  // Verificar se email já está registado
  const checkRes = await fetch(
   `${API}/users?email=${encodeURIComponent(email)}`,
  );
  const existing = await checkRes.json();

  if (existing.length > 0) {
   showFeedback("register-feedback", "Este email já está registado.", "error");
   btn.disabled = false;
   btn.textContent = "Criar conta";
   return;
  }

  // Objeto que será guardado no db.json pelo json-server
  const newUser = {
   firstName,
   lastName,
   email,
   password,
   role: "user",
   initials: getInitials(firstName, lastName),
   createdAt: new Date().toISOString(),
  };

  // POST → json-server adiciona ao array "users" do db.json e atribui um id automático
  const createRes = await fetch(`${API}/users`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(newUser),
  });

  if (!createRes.ok) throw new Error("Erro ao criar conta.");

  const created = await createRes.json();
  saveSession(created);

  showFeedback("register-feedback", "Conta criada! A entrar…", "success");
  setTimeout(() => {
   window.location.href = "dashboard.html";
  }, 900);
 } catch (err) {
  showFeedback(
   "register-feedback",
   "Não foi possível ligar ao servidor.",
   "error",
  );
  btn.disabled = false;
  btn.textContent = "Criar conta";
 }
}

/* Expõe as funções ao HTML (onclick="...") */
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
