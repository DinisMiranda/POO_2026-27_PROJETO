// controllers/landing.js — Controller: orquestra View + Model para a landing page
import { LandingView as View } from "../views/landingView.js";
import { UserModel as Model } from "../models/userModel.js";

/** Redireciona automaticamente se já há sessão activa */
function checkExistingSession() {
 if (Model.getSession()) {
  View.redirectToDashboard();
 }
}

/** Vincula eventos de tab */
function bindTabs() {
 View.tabLogin.addEventListener("click", () => View.switchTab("login"));
 View.tabRegister.addEventListener("click", () => View.switchTab("register"));
}

/** Vincula o botão CTA do hero */
function bindCta() {
 View.btnCta?.addEventListener("click", () => {
  View.switchTab("register");
  View.scrollToAuth();
 });
}

/** Lida com o submit do login */
async function handleLogin(e) {
 e.preventDefault();
 View.clearErrors();
 const data = View.getLoginData();

 if (!data.email || !data.password) {
  View.showError("login", "Preenche todos os campos.");
  return;
 }

 View.setLoading(View.btnLogin, true);
 try {
  const user = await Model.login(data);
  Model.saveSession(user);
  View.redirectToDashboard();
 } catch (err) {
  View.showError("login", err.message);
 } finally {
  View.setLoading(View.btnLogin, false);
 }
}

/** Lida com o submit do registo */
async function handleRegister(e) {
 e.preventDefault();
 View.clearErrors();
 const data = View.getRegisterData();

 if (!data.name || !data.email || !data.password) {
  View.showError("register", "Preenche os campos obrigatórios.");
  return;
 }
 if (data.password.length < 6) {
  View.showError("register", "A password deve ter pelo menos 6 caracteres.");
  return;
 }

 View.setLoading(View.btnRegister, true);
 try {
  const user = await Model.register(data);
  Model.saveSession(user);
  View.redirectToDashboard();
 } catch (err) {
  View.showError("register", err.message);
 } finally {
  View.setLoading(View.btnRegister, false);
 }
}

/** Init */
function init() {
 checkExistingSession();
 bindTabs();
 bindCta();
 View.loginForm.addEventListener("submit", handleLogin);
 View.registerForm.addEventListener("submit", handleRegister);
}

init();
