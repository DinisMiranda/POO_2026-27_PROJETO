export const SettingsView = {
 languageSelect: document.getElementById("lang"),
 saveButton: document.getElementById("save-settings"),
 feedback: document.getElementById("settings-feedback"),

 showFeedback(message) {
  if (!this.feedback) return;

  this.feedback.textContent = message;
  this.feedback.className = "checkin-feedback checkin-feedback--success visible";

  setTimeout(() => {
   this.feedback.classList.remove("visible");
  }, 2400);
 },

 setLanguageValue(language) {
  if (this.languageSelect) {
   this.languageSelect.value = language;
  }
 },

 getSelectedLanguage() {
  return this.languageSelect?.value || "";
 },

 bindSave(handler) {
  this.saveButton?.addEventListener("click", handler);
 },
};
