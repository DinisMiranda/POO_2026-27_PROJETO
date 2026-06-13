import {
 getLanguage,
 initI18n,
 setLanguage,
 setPageTitle,
 t,
} from "../data/i18n.js";
import { mountAppShell } from "../views/app-shell.js";

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
 }

 saveButton?.addEventListener("click", () => {
  refreshPageLanguage(languageSelect?.value || getLanguage());
  showFeedback(t("settings.saved"));
 });
}

initSettingsPage();
