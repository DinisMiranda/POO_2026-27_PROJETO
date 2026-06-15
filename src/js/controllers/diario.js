import { apiFetch } from "../data/http.js";
import { getRecommendation } from "../models/recommendation.js";
import { ProgressModel } from "../models/progressModel.js";
import { StreakModel } from "../models/streakModel.js";
import { requireSession } from "../data/session.js";

const moodForm = document.getElementById("mood-form");
const moodPicker = document.getElementById("mood-picker");
const moodHint = document.getElementById("mood-hint");
const moodNote = document.getElementById("mood-note");
const moodSubmit = document.getElementById("mood-submit");
const moodHistory = document.getElementById("mood-history");
const feedbackEl = document.getElementById("diary-feedback");
const recommendationText = document.getElementById("recommendation-text");
const recommendationRule = document.getElementById("recommendation-rule");

const MOOD_LABELS = {
 1: "Muito baixo",
 2: "Baixo",
 3: "Moderado",
 4: "Bom",
 5: "Muito bem",
};

let activeUser = null;
let selectedMood = null;

function dateStr(date = new Date()) {
 return date.toISOString().slice(0, 10);
}

function formatDate(isoDate) {
 const [y, m, d] = isoDate.split("-");
 return `${d}/${m}/${y}`;
}

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

async function fetchMoodLogs(userId) {
 const res = await apiFetch(`/moodLogs?userId=${userId}`);
 if (!res?.ok) return [];
 const logs = await res.json();
 return logs.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

async function saveMoodLog(userId, mood, note, existingLog) {
 const today = dateStr();
 const payload = { mood, note: note || "" };

 if (existingLog?.id) {
  const res = await apiFetch(`/moodLogs/${existingLog.id}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res?.ok) throw new Error("Erro ao atualizar registo.");
  return false;
 }

 const res = await apiFetch("/moodLogs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, date: today, ...payload }),
 });
 if (!res?.ok) throw new Error("Erro ao guardar registo.");
 return true;
}

async function saveCheckin(userId, level, note) {
 const today = dateStr();
 const res = await apiFetch("/checkins", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   userId,
   date: today,
   level,
   note: note || "",
  }),
 });
 if (!res?.ok) throw new Error("Erro ao guardar check-in.");
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

function escapeHtml(value) {
 return String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
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
  const logs = await fetchMoodLogs(activeUser.id);
  const today = dateStr();
  const existing = logs.find((entry) => entry.date === today);
  const isNewToday = await saveMoodLog(
   activeUser.id,
   selectedMood,
   note,
   existing,
  );

  if (isNewToday) {
   await saveCheckin(activeUser.id, selectedMood, note);
   const checkin = await StreakModel.doCheckin(activeUser.id);
   if (!checkin.alreadyDone) {
    await Promise.all([
     ProgressModel.syncChallenges(activeUser.id, checkin),
     ProgressModel.syncMedals(activeUser.id, checkin),
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
 activeUser = await requireSession();
 if (!activeUser) return;

 bindMoodPicker();
 moodForm?.addEventListener("submit", handleSubmit);
 await refresh();
}

init();
