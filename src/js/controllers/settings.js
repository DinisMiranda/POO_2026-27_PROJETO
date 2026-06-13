import {
 applyTranslations,
 getStoredLocale,
 LOCALES,
 saveLocale,
 t,
} from "../data/i18n.js";

const langSelect = document.getElementById("lang");
const saveBtn = document.getElementById("btn-save-settings");
const feedback = document.getElementById("settings-feedback");

function loadFormState() {
 const locale = getStoredLocale();
 if (langSelect) {
  langSelect.value = locale === LOCALES.en ? "en" : "pt";
 }
 applyTranslations(locale);
}

saveBtn?.addEventListener("click", () => {
 const selected = langSelect?.value === "en" ? LOCALES.en : LOCALES.pt;
 saveLocale(selected);
 applyTranslations(selected);

 if (feedback) {
  feedback.textContent = t("settings.saved", selected);
  feedback.classList.add("visible");
  setTimeout(() => feedback.classList.remove("visible"), 2800);
 }
});

loadFormState();
