export const LandingView = {
 tabLogin: document.getElementById("tab-login"),
 tabRegister: document.getElementById("tab-register"),
 panelLogin: document.getElementById("panel-login"),
 panelRegister: document.getElementById("panel-register"),
 loginForm: document.getElementById("loginForm"),
 registerForm: document.getElementById("registerForm"),
 btnLogin: document.getElementById("btn-login"),
 btnRegister: document.getElementById("btn-register"),
 btnCta: document.getElementById("cta-comecar"),
 loginError: document.getElementById("loginError"),
 registerError: document.getElementById("registerError"),
 authHeading: document.getElementById("auth-heading"),
 authSubheading: document.getElementById("auth-subheading"),

 switchTab(tab) {
  const isLogin = tab === "login";

  this.tabLogin.classList.toggle("active", isLogin);
  this.tabRegister.classList.toggle("active", !isLogin);

  this.tabLogin.setAttribute("aria-selected", String(isLogin));
  this.tabRegister.setAttribute("aria-selected", String(!isLogin));

  this.panelLogin.hidden = !isLogin;
  this.panelRegister.hidden = isLogin;

  if (isLogin) {
   this.authHeading.textContent = "Bem-vindo(a) de volta";
   this.authSubheading.textContent =
    "Entra na tua conta para aceder à dashboard.";
  } else {
   this.authHeading.textContent = "Bem-vindo(a)";
   this.authSubheading.textContent =
    "Regista-te ou inicia sessão na tua área Zenify.";
  }

  this.clearErrors();
 },

 showError(panel, message) {
  const el = panel === "login" ? this.loginError : this.registerError;
  el.textContent = message;
  el.classList.remove("hidden");
 },

 showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`error-${fieldId}`);

  if (input) {
   input.classList.add("input-error");
  }

  if (error) {
   error.textContent = message;
   error.classList.add("visible");
  }
 },

 clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`error-${fieldId}`);

  if (input) {
   input.classList.remove("input-error");
  }

  if (error) {
   error.textContent = "";
   error.classList.remove("visible");
  }
 },

 clearAllFieldErrors() {
  const errors = document.querySelectorAll(".field-error");
  const inputs = document.querySelectorAll(".field input");

  errors.forEach((el) => {
   el.textContent = "";
   el.classList.remove("visible");
  });

  inputs.forEach((input) => {
   input.classList.remove("input-error");
  });
 },

 clearErrors() {
  [this.loginError, this.registerError].forEach((el) => {
   el.textContent = "";
   el.classList.add("hidden");
  });

  this.clearAllFieldErrors();
 },

 setLoading(btn, loading) {
  btn.disabled = loading;

  if (btn.id === "btn-login") {
   btn.textContent = loading ? "A entrar…" : "Entrar";
  }

  if (btn.id === "btn-register") {
   btn.textContent = loading ? "A criar conta…" : "Registar";
  }
 },

 redirectToDashboard() {
  window.location.href = "dashboard.html";
 },

 scrollToAuth() {
  document
   .getElementById("auth-panel")
   ?.scrollIntoView({ behavior: "smooth", block: "center" });
 },

 getLoginData() {
  return {
   email: document.getElementById("login-email").value.trim(),
   password: document.getElementById("login-password").value,
  };
 },

 getRegisterData() {
  return {
   firstName: document.getElementById("reg-first-name").value.trim(),
   lastName: document.getElementById("reg-last-name").value.trim(),
   email: document.getElementById("reg-email").value.trim(),
   dob: document.getElementById("reg-dob").value,
   password: document.getElementById("reg-password").value,
  };
 },
};
