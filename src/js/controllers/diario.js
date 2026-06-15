import { getRecommendation } from "../models/recommendation.js";
import { ProgressModel } from "../models/progressModel.js";
import {
 fetchMoodLogs,
 saveCheckinRecord,
 saveMoodLog,
} from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import {
 dateStr,
 escapeHtml,
 formatDate,
 MOOD_LABELS,
} from "../data/utils.js";

const moodForm = document.getElementById("mood-form");
const moodPicker = document.getElementById("mood-picker");
const moodHint = document.getElementById("mood-hint");
const moodNote = document.getElementById("mood-note");
const moodSubmit = document.getElementById("mood-submit");
const moodHistory = document.getElementById("mood-history");
const feedbackEl = document.getElementById("diary-feedback");
const recommendationText = document.getElementById("recommendation-text");
const recommendationRule = document.getElementById("recommendation-rule");

let activeUser = null;
let selectedMood = null;

function showFeedback(message, type = "success") {
 if (!feedbackEl) return;
 feedbackEl.textContent = message;
 feedbackEl.className = `diary-feedback diary-feedback--${type} visible`;
}

function clearFeedback() {
 if (!feedbackEl) return;
 feedbackEl.textContent = "";
 feedbackEl.className = "diary-feedback";
}

function setRecommendation(level) {
 const rec = getRecommendation(level);
 if (recommendationText) recommendationText.textContent = rec.text;
 if (recommendationRule) {
  recommendationRule.textContent = rec.rule ? `Regra: ${rec.rule}` : "";
 }
}

function renderHistory(logs) {
 if (!moodHistory) return;

 if (!logs.length) {
  moodHistory.innerHTML =
   `<li class="diary-empty">Ainda não tens registos. Guarda o teu humor acima.</li>`;
  return;
 }

 moodHistory.innerHTML = logs
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
}

function prefillToday(logs) {
 const today = logs.find((entry) => entry.date === dateStr());
 if (!today) return;

 selectedMood = Math.round(Number(today.mood));
 moodPicker?.querySelectorAll(".mood-pick").forEach((btn) => {
  btn.classList.toggle("is-selected", Number(btn.dataset.mood) === selectedMood);
 });
 if (moodHint) moodHint.textContent = MOOD_LABELS[selectedMood] || "";
 if (moodNote && today.note) moodNote.value = today.note;
 if (moodSubmit) moodSubmit.disabled = false;
 setRecommendation(selectedMood);
}

async function refresh() {
 const logs = await fetchMoodLogs(activeUser.id);
 renderHistory(logs);
 prefillToday(logs);
}

async function handleSubmit(event) {
 event.preventDefault();
 if (!activeUser || selectedMood == null) return;

 const note = moodNote?.value.trim() || "";
 moodSubmit.disabled = true;
 clearFeedback();

 try {
  const isNewToday = await saveMoodLog(activeUser.id, selectedMood, note);

  if (isNewToday) {
   await saveCheckinRecord(activeUser.id, selectedMood, note);
   const checkin = await ProgressModel.doCheckin(activeUser.id);
   if (!checkin.alreadyDone) {
    await Promise.all([
     ProgressModel.syncChallenges(activeUser.id),
     ProgressModel.syncMedals(activeUser.id),
    ]);
   }
   showFeedback(`Registo guardado! Streak: ${checkin.streak} dias.`);
  } else {
   showFeedback("Registo de hoje atualizado.");
  }

  setRecommendation(selectedMood);
  await refresh();
 } catch {
  showFeedback("Não foi possível guardar. Verifica se o json-server está ativo.", "error");
 } finally {
  moodSubmit.disabled = selectedMood == null;
 }
}

function bindMoodPicker() {
 moodPicker?.addEventListener("click", (event) => {
  const btn = event.target.closest(".mood-pick");
  if (!btn) return;

  selectedMood = Number(btn.dataset.mood);
  moodPicker.querySelectorAll(".mood-pick").forEach((pick) => {
   pick.classList.toggle("is-selected", pick === btn);
  });

  if (moodHint) moodHint.textContent = MOOD_LABELS[selectedMood] || "";
  if (moodSubmit) moodSubmit.disabled = false;
  setRecommendation(selectedMood);
 });
}

async function init() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 bindMoodPicker();
 moodForm?.addEventListener("submit", handleSubmit);
 await refresh();
}

init();
