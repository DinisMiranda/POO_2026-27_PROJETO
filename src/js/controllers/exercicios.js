import { getActivities } from "../data/activity-service.js";
import { ProgressModel } from "../models/progressModel.js";
import { requireSession } from "../data/session.js";
import { mountExercisePlayer } from "../views/exercise-players.js";
import { apiFetch } from "../data/http.js";
import { mountAppShell } from "../views/app-shell.js";

const TYPE_LABELS = {
 respiracao: "Respiração",
 meditacao: "Meditação",
 relaxamento: "Relaxamento",
 diario: "Diário",
 movimento: "Movimento",
};

const TYPE_ICONS = {
 respiracao: "calm",
 meditacao: "focus",
 relaxamento: "calm",
 diario: "ground",
 movimento: "focus",
};

const gridEl = document.getElementById("exercises-grid");
const modalEl = document.getElementById("exercise-modal");
const modalTitle = document.getElementById("exercise-modal-title");
const modalMeta = document.getElementById("exercise-modal-meta");
const modalContent = document.getElementById("exercise-modal-content");
const completeBtn = document.getElementById("exercise-complete");
const toastEl = document.getElementById("exercise-toast");

let activeUser = null;
let currentActivity = null;
let activePlayer = null;
let activities = [];

function showToast(msg, duration = 3500) {
 if (!toastEl) return;
 toastEl.textContent = msg;
 toastEl.classList.add("show");
 setTimeout(() => toastEl.classList.remove("show"), duration);
}

function iconClass(type) {
 return TYPE_ICONS[type] || "calm";
}

function typeLabel(type) {
 return TYPE_LABELS[type] || type;
}

function closeModal() {
 activePlayer?.destroy?.();
 activePlayer = null;
 currentActivity = null;
 if (modalContent) modalContent.innerHTML = "";
 if (modalEl) modalEl.hidden = true;
 if (completeBtn) {
  completeBtn.disabled = true;
  completeBtn.textContent = "Concluir exercício";
 }
}

function openModal(activity) {
 if (!modalEl || !modalContent) return;

 currentActivity = activity;
 activePlayer?.destroy?.();

 if (modalTitle) modalTitle.textContent = activity.title;
 if (modalMeta) {
  modalMeta.textContent = `${activity.duration || 5} min · ${typeLabel(activity.type)}`;
 }
 if (completeBtn) completeBtn.disabled = true;

 modalEl.hidden = false;

 activePlayer = mountExercisePlayer(activity, modalContent, {
  onReadyToComplete(canComplete) {
   if (completeBtn) completeBtn.disabled = !canComplete;
  },
 });
}

async function saveGratitudeJournal(data) {
 if (!activeUser || !data?.entries?.length) return;

 const today = new Date().toISOString().slice(0, 10);
 await apiFetch("/moodLogs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   userId: activeUser.id,
   date: today,
   mood: data.mood,
   note: data.entries.join(" | "),
  }),
 });
}

async function completeExercise() {
 if (!activeUser || !currentActivity) return;

 if (activePlayer?.validate && !activePlayer.validate()) {
  showToast("Completa o exercício antes de concluir.");
  return;
 }

 if (completeBtn) completeBtn.disabled = true;

 try {
  if (currentActivity.type === "diario" && activePlayer?.getJournalData) {
   await saveGratitudeJournal(activePlayer.getJournalData());
  }

  const result = await ProgressModel.completeActivity(
   activeUser.id,
   currentActivity.type,
  );

  await Promise.all([
   ProgressModel.syncChallenges(activeUser.id),
   ProgressModel.syncMedals(activeUser.id),
  ]);

  const typeMsg = result.newType ? " Novo tipo de exercício registado!" : "";
  showToast(`Exercício concluído! +${result.xpGain} XP.${typeMsg}`);
  closeModal();
 } catch (err) {
  console.error("Erro ao concluir exercício:", err);
  showToast("Erro ao registar o exercício. Tenta novamente.");
  if (completeBtn) completeBtn.disabled = false;
 }
}

function renderActivities(list) {
 if (!gridEl) return;

 if (!list.length) {
  gridEl.innerHTML =
   `<p class="card lead">Nenhum exercício disponível. Verifica se o json-server está ativo.</p>`;
  return;
 }

 gridEl.innerHTML = list
  .map(
   (activity) => `
    <article class="exercise-card">
      <div class="exercise-card-top">
        <div class="exercise-icon ${iconClass(activity.type)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
          </svg>
        </div>
        <div class="exercise-info">
          <h4>${activity.title}</h4>
          <p>${activity.description || ""}</p>
          <div class="exercise-meta">
            <span>${activity.duration || 5} min</span>
            <span>${typeLabel(activity.type)}</span>
          </div>
        </div>
      </div>
      <button type="button" class="exercise-card-footer" data-start-activity="${activity.id}">
        <span>Iniciar</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </article>
  `,
  )
  .join("");
}

async function init() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 try {
  activities = await getActivities();
 } catch (err) {
  console.error("Erro ao carregar exercícios:", err);
 }

 renderActivities(activities);

 gridEl?.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-start-activity]");
  if (!btn) return;
  const activity = activities.find((a) => String(a.id) === btn.dataset.startActivity);
  if (activity) openModal(activity);
 });

 completeBtn?.addEventListener("click", completeExercise);

 modalEl?.querySelectorAll("[data-exercise-close]").forEach((el) => {
  el.addEventListener("click", closeModal);
 });
}

init();
