import { LandingView as View } from "../views/landingView.js";
import { initI18n, setPageTitle, t } from "../data/i18n.js";
import { UserModel as Model } from "../models/userModel.js";
import { bindNotificationButtons } from "../views/notifications-view.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function checkExistingSession() {
 if (Model.getSession()) {
  View.redirectToDashboard();
 }
}

function bindTabs() {
 View.tabLogin?.addEventListener("click", () => View.switchTab("login"));
 View.tabRegister?.addEventListener("click", () => View.switchTab("register"));
}

function bindCta() {
 const scrollToRegister = () => {
  View.switchTab("register");
  View.scrollToAuth();
 };

 View.btnCta?.addEventListener("click", scrollToRegister);

 document.querySelectorAll("[data-scroll-auth]").forEach((btn) => {
  btn.addEventListener("click", scrollToRegister);
 });
}

function validateLoginData(data) {
 let valid = true;

 if (!data.email) {
  View.showFieldError("login-email", t("landing.error.loginEmailRequired"));
  valid = false;
 } else if (!EMAIL_REGEX.test(data.email)) {
  View.showFieldError("login-email", t("landing.error.loginEmailInvalid"));
  valid = false;
 }

 if (!data.password) {
  View.showFieldError(
   "login-password",
   t("landing.error.loginPasswordRequired"),
  );
  valid = false;
 }

 return valid;
}

async function handleLogin(event) {
 event.preventDefault();
 View.clearErrors();

 const data = View.getLoginData();

 if (!validateLoginData(data)) {
  return;
 }

 View.setLoading(View.btnLogin, true);

 try {
  const user = await Model.login(data);
  Model.saveSession(user);
  View.redirectToDashboard();
 } catch (error) {
  View.showError("login", error.message);
 } finally {
  View.setLoading(View.btnLogin, false);
 }
}

function validateRegisterData(data) {
 let valid = true;

 if (!data.firstName) {
  View.showFieldError(
   "reg-first-name",
   t("landing.error.registerFirstNameRequired"),
  );
  valid = false;
 }

 if (!data.lastName) {
  View.showFieldError(
   "reg-last-name",
   t("landing.error.registerLastNameRequired"),
  );
  valid = false;
 }

 if (!data.email) {
  View.showFieldError("reg-email", t("landing.error.registerEmailRequired"));
  valid = false;
 } else if (!EMAIL_REGEX.test(data.email)) {
  View.showFieldError("reg-email", t("landing.error.registerEmailInvalid"));
  valid = false;
 }

 if (!data.dob) {
  View.showFieldError("reg-dob", t("landing.error.registerDobRequired"));
  valid = false;
 }

 if (!data.password) {
  View.showFieldError(
   "reg-password",
   t("landing.error.registerPasswordRequired"),
  );
  valid = false;
 } else if (data.password.length < 6) {
  View.showFieldError(
   "reg-password",
   t("landing.error.registerPasswordLength"),
  );
  valid = false;
 }

 return valid;
}

async function handleRegister(event) {
 event.preventDefault();
 View.clearErrors();

 const data = View.getRegisterData();

 if (!validateRegisterData(data)) {
  View.showError("register", t("landing.error.fixFields"));
  return;
 }

 View.setLoading(View.btnRegister, true);

 try {
  const user = await Model.register(data);
  Model.saveSession(user);
  View.redirectToDashboard();
 } catch (error) {
  View.showError("register", error.message);
 } finally {
  View.setLoading(View.btnRegister, false);
 }
}

function bindFieldCleanup() {
 const ids = [
  "login-email",
  "login-password",
  "reg-first-name",
  "reg-last-name",
  "reg-email",
  "reg-dob",
  "reg-password",
 ];

 ids.forEach((id) => {
  const input = document.getElementById(id);

  input?.addEventListener("input", () => {
   View.clearFieldError(id);
  });

  input?.addEventListener("change", () => {
   View.clearFieldError(id);
  });
 });
}

function bindFaqAccordion() {
 document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  const body = item.querySelector(".faq-body");
  const inner = item.querySelector(".faq-body-inner");

  if (!summary || !body || !inner) {
   return;
  }

  summary.addEventListener("click", (event) => {
   event.preventDefault();

   if (item.dataset.animating === "true") {
    return;
   }

   if (item.classList.contains("is-open")) {
    item.dataset.animating = "true";
    item.classList.remove("is-open");

    const onClose = (transitionEvent) => {
     if (transitionEvent.propertyName !== "grid-template-rows") {
      return;
     }

     item.open = false;
     item.dataset.animating = "false";
     body.removeEventListener("transitionend", onClose);
    };

    body.addEventListener("transitionend", onClose);
    return;
   }

   item.open = true;
   item.dataset.animating = "true";

   requestAnimationFrame(() => {
    item.classList.add("is-open");
   });

   const onOpen = (transitionEvent) => {
    if (transitionEvent.propertyName !== "grid-template-rows") {
     return;
    }

    item.dataset.animating = "false";
    body.removeEventListener("transitionend", onOpen);
   };

   body.addEventListener("transitionend", onOpen);
  });
 });
}

function bindLandingTopbar() {
 bindNotificationButtons(document);

 const session = Model.getSession();
 const avatarEl = document.getElementById("landing-avatar");
 const profileLink = document.getElementById("landing-profile-link");

 if (!avatarEl || !profileLink) return;

 if (session) {
  const first = (session.firstName || "").trim();
  const last = (session.lastName || "").trim();
  avatarEl.textContent =
   first && last ?
    `${first[0]}${last[0]}`.toUpperCase()
   : (session.name?.[0] || "Z").toUpperCase();
  profileLink.href = "dashboard.html";
  profileLink.setAttribute("aria-label", "Ir para dashboard");
 } else {
  avatarEl.textContent = "ZU";
  profileLink.href = "#auth-panel";
  profileLink.setAttribute("aria-label", "Ir para registo");
  profileLink.addEventListener("click", (event) => {
   event.preventDefault();
   View.switchTab("register");
   View.scrollToAuth();
  });
 }
}

function init() {
 initI18n();
 setPageTitle("page.title.landing");

 checkExistingSession();
 bindTabs();
 bindCta();
 bindFieldCleanup();
 bindFaqAccordion();
 bindLandingTopbar();

 View.loginForm?.addEventListener("submit", handleLogin);
 View.registerForm?.addEventListener("submit", handleRegister);
}

init();
