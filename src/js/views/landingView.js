// views/landingView.js — View: manipulação do DOM na landing page
export const LandingView = {
 // Tabs
 tabLogin: document.getElementById("tab-login"),
 tabRegister: document.getElementById("tab-register"),
 panelLogin: document.getElementById("panel-login"),
 panelRegister: document.getElementById("panel-register"),

 // Formulários
 loginForm: document.getElementById("loginForm"),
 registerForm: document.getElementById("registerForm"),

 // Botões
 btnLogin: document.getElementById("btn-login"),
 btnRegister: document.getElementById("btn-register"),
 btnCta: document.getElementById("cta-comecar"),

 // Erros
 loginError: document.getElementById("loginError"),
 registerError: document.getElementById("registerError"),

 // Textos do cabeçalho auth
 authHeading: document.getElementById("auth-heading"),
 authSubheading: document.getElementById("auth-subheading"),

 /** Troca entre os painéis Login / Register */
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
   this.authSubheading.textContent = "Inicia sessão para acederes à tua área.";
  } else {
   this.authHeading.textContent = "Bem-vindo(a)";
   this.authSubheading.textContent =
    "Regista-te para acederes à tua área de equilíbrio.";
  }
  this.clearErrors();
 },

 /** Mostra erro no painel correto */
 showError(panel, message) {
  const el = panel === "login" ? this.loginError : this.registerError;
  el.textContent = message;
  el.classList.remove("hidden");
 },

 /** Limpa todos os erros */
 clearErrors() {
  [this.loginError, this.registerError].forEach((el) => {
   el.textContent = "";
   el.classList.add("hidden");
  });
 },

 /** Estado loading do botão */
 setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent =
   loading ?
    btn.id === "btn-login" ?
     "A entrar…"
    : "A criar conta…"
   : btn.id === "btn-login" ? "Entrar"
   : "Registar";
 },

 /** Redireciona para a dashboard */
 redirectToDashboard() {
  window.location.href = "dashboard.html";
 },

 /** Scroll suave para o painel de auth */
 scrollToAuth() {
  document.getElementById("auth-panel")?.scrollIntoView({ behavior: "smooth" });
 },

 /** Devolve os dados do form de login */
 getLoginData() {
  return {
   email: document.getElementById("login-email").value.trim(),
   password: document.getElementById("login-password").value,
  };
 },

 /** Devolve os dados do form de register */
 getRegisterData() {
  return {
   name: document.getElementById("reg-name").value.trim(),
   email: document.getElementById("reg-email").value.trim(),
   password: document.getElementById("reg-password").value,
   dob: document.getElementById("reg-dob").value,
  };
 },
};
