import {
 dateStr,
 escapeHtml,
 formatDate,
 MOOD_LABELS,
} from "../data/utils.js";

export const DiarioView = {
 moodForm: document.getElementById("mood-form"),
 moodPicker: document.getElementById("mood-picker"),
 moodHint: document.getElementById("mood-hint"),
 moodNote: document.getElementById("mood-note"),
 moodSubmit: document.getElementById("mood-submit"),
 moodHistory: document.getElementById("mood-history"),
 feedbackEl: document.getElementById("diary-feedback"),
 recommendationText: document.getElementById("recommendation-text"),
 recommendationRule: document.getElementById("recommendation-rule"),

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

 setRecommendation(rec) {
  if (this.recommendationText) this.recommendationText.textContent = rec.text;
  if (this.recommendationRule) {
   this.recommendationRule.textContent = rec.rule ? `Regra: ${rec.rule}` : "";
  }
 },

 renderHistory(logs) {
  if (!this.moodHistory) return;

  if (!logs.length) {
   this.moodHistory.innerHTML =
    `<li class="diary-empty">Ainda não tens registos. Guarda o teu humor acima.</li>`;
   return;
  }

  this.moodHistory.innerHTML = logs
   .slice(0, 20)
   .map((entry) => {
    const level = Math.round(Number(entry.mood));
    const note = entry.note?.trim();
    return `
    <li class="list-row diary-history-row">
     <div>
      <strong>${formatDate(entry.date)} · ${level}/5</strong>
      <span class="diary-history-meta">${MOOD_LABELS[level] || ""}</span>
      ${note ? `<p class="diary-history-note">${escapeHtml(note)}</p>` : ""}
     </div>
    </li>`;
   })
   .join("");
 },

 prefillToday(logs) {
  const today = logs.find((entry) => entry.date === dateStr());
  if (!today) return null;

  const mood = Math.round(Number(today.mood));
  this.moodPicker?.querySelectorAll(".mood-pick").forEach((btn) => {
   btn.classList.toggle("is-selected", Number(btn.dataset.mood) === mood);
  });
  if (this.moodHint) this.moodHint.textContent = MOOD_LABELS[mood] || "";
  if (this.moodNote && today.note) this.moodNote.value = today.note;
  if (this.moodSubmit) this.moodSubmit.disabled = false;
  return mood;
 },

 selectMood(mood) {
  this.moodPicker?.querySelectorAll(".mood-pick").forEach((pick) => {
   pick.classList.toggle("is-selected", Number(pick.dataset.mood) === mood);
  });
  if (this.moodHint) this.moodHint.textContent = MOOD_LABELS[mood] || "";
  if (this.moodSubmit) this.moodSubmit.disabled = false;
 },

 setSubmitDisabled(disabled) {
  if (this.moodSubmit) this.moodSubmit.disabled = disabled;
 },

 getNote() {
  return this.moodNote?.value.trim() || "";
 },
};
