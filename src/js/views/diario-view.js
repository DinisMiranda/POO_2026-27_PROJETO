import { escapeHtml, formatDate, formatDateTime } from "../data/utils.js";

export const DiarioView = {
 journalForm: document.getElementById("journal-form"),
 journalTitle: document.getElementById("journal-title"),
 journalBody: document.getElementById("journal-body"),
 journalSubmit: document.getElementById("journal-submit"),
 journalLog: document.getElementById("journal-log"),
 feedbackEl: document.getElementById("diary-feedback"),
 journalModal: document.getElementById("journal-modal"),
 journalModalDate: document.getElementById("journal-modal-date"),
 journalModalTitle: document.getElementById("journal-modal-title"),
 journalModalBody: document.getElementById("journal-modal-body"),

 showFeedback(message, type = "success") {
  if (!this.feedbackEl) return;
  this.feedbackEl.textContent = message;
  this.feedbackEl.className = `diary-feedback diary-feedback--${type} visible`;
 },

 clearFeedback() {
  if (!this.feedbackEl) return;
  this.feedbackEl.textContent = "";
  this.feedbackEl.className = "diary-feedback";
 },

 getFormData() {
  return {
   title: this.journalTitle?.value.trim() || "",
   body: this.journalBody?.value.trim() || "",
  };
 },

 resetForm() {
  if (this.journalForm) this.journalForm.reset();
 },

 setSubmitDisabled(disabled) {
  if (this.journalSubmit) this.journalSubmit.disabled = disabled;
 },

 renderJournalLog(entries) {
  if (!this.journalLog) return;

  if (!entries.length) {
   this.journalLog.innerHTML =
    `<li class="journal-log-empty">Ainda não tens registos. Escreve o teu primeiro texto acima.</li>`;
   return;
  }

  this.journalLog.innerHTML = entries
   .map(
    (entry) => `
    <li>
     <button type="button" class="journal-entry-card" data-entry-id="${escapeHtml(entry.id)}">
      <span class="journal-entry-date">${formatDate(entry.date)}</span>
      <strong class="journal-entry-title">${escapeHtml(entry.title)}</strong>
      <span class="journal-entry-preview">${escapeHtml(entry.body.slice(0, 90))}${entry.body.length > 90 ? "…" : ""}</span>
     </button>
    </li>`,
   )
   .join("");
 },

 openJournalModal(entry) {
  if (!this.journalModal || !entry) return;

  if (this.journalModalDate) {
   this.journalModalDate.textContent = formatDateTime(entry.createdAt || entry.date);
  }
  if (this.journalModalTitle) {
   this.journalModalTitle.textContent = entry.title;
  }
  if (this.journalModalBody) {
   this.journalModalBody.textContent = entry.body;
  }

  this.journalModal.hidden = false;
  document.body.classList.add("journal-modal-open");
 },

 closeJournalModal() {
  if (!this.journalModal) return;
  this.journalModal.hidden = true;
  document.body.classList.remove("journal-modal-open");
 },

 bindJournalForm(handler) {
  this.journalForm?.addEventListener("submit", handler);
 },

 bindJournalLog(handler) {
  this.journalLog?.addEventListener("click", (event) => {
   const btn = event.target.closest("[data-entry-id]");
   if (!btn) return;
   handler(btn.dataset.entryId);
  });
 },

 bindModalClose(handler) {
  document.querySelectorAll("[data-journal-close]").forEach((el) => {
   el.addEventListener("click", handler);
  });
 },
};
