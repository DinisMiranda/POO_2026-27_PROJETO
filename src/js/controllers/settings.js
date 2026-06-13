import {
 applyTranslations,
 getLanguage,
 setLanguage,
 t,
} from "../data/i18n.js";
import { mountTopbar } from "../views/topbar-view.js";
import { mountZenifySidebar } from "../views/sidebar-view.js";

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

function refreshLanguage(language) {
 setLanguage(language);
 applyTranslations();
 mountZenifySidebar(document.body.dataset.zenifyPage);
 mountTopbar();

 if (languageSelect) {
  languageSelect.value = getLanguage();
 }
}

if (languageSelect) {
 languageSelect.value = getLanguage();

 languageSelect.addEventListener("change", () => {
  refreshLanguage(languageSelect.value);
  showFeedback(t("settings.saved"));
 });
}

saveButton?.addEventListener("click", () => {
 refreshLanguage(languageSelect?.value || getLanguage());
 showFeedback(t("settings.saved"));
});

applyTranslations();
