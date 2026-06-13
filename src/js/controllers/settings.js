import {
 applyTranslations,
 getLanguage,
 setLanguage,
 t,
 initI18n,
 setPageTitle,
} from "../data/i18n.js";
import { mountAppShell } from "../views/app-shell.js";

const pageKey = document.body.dataset.zenifyPage || "configuracoes";
const languageSelect = document.getElementById("lang");
const saveButton = document.getElementById("save-settings");
const feedback = document.getElementById("settings-feedback");

function showFeedback(message) {
 if (!feedback) return;

 feedback.textContent = message;
 feedback.className = "checkin-feedback checkin-feedback--success visible";

 setTimeout(() => {
  feedback.classList.remove("visible");
 }, 2400);
}

function renderShell() {
 mountAppShell();
}

function refreshPageLanguage(language) {
 setLanguage(language);
 initI18n();
 renderShell();
 setPageTitle("page.title.settings");

 if (languageSelect) {
  languageSelect.value = getLanguage();
 }
}

function initSettingsPage() {
 initI18n();
 renderShell();
 setPageTitle("page.title.settings");

 if (languageSelect) {
  languageSelect.value = getLanguage();

  languageSelect.addEventListener("change", () => {
   refreshPageLanguage(languageSelect.value);
   showFeedback(t("settings.saved"));
  });
 }

 saveButton?.addEventListener("click", () => {
  refreshPageLanguage(languageSelect?.value || getLanguage());
  showFeedback(t("settings.saved"));
 });

 applyTranslations();
}

initSettingsPage();
