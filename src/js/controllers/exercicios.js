import { getActivities } from "../data/activity-service.js";
import { ProgressService } from "../data/progress-service.js";
import { requireSession } from "../data/session.js";
import { apiFetch } from "../data/http.js";
import { mountAppShell } from "../views/app-shell.js";
import { ExerciciosView as View } from "../views/exercicios-view.js";

let activeUser = null;
let currentActivity = null;
let activities = [];

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

 const player = View.activePlayer;

 if (player?.validate && !player.validate()) {
  View.showToast("Completa o exercício antes de concluir.");
  return;
 }

 View.setCompleteEnabled(false);

 try {
  if (currentActivity.type === "diario" && player?.getJournalData) {
   await saveGratitudeJournal(player.getJournalData());
  }

  const activityTitle = currentActivity.title;

  const result = await ProgressService.completeActivity(
   activeUser.id,
   currentActivity.type,
  );

  await Promise.all([
   ProgressService.syncChallenges(activeUser.id),
   ProgressService.syncMedals(activeUser.id),
  ]);

  const typeMsg = result.newType ? "Registaste um novo tipo de exercício!" : "";
  currentActivity = null;
  View.closeModal();
  View.showXpModal({
   xpGain: result.xpGain,
   title: activityTitle,
   extraMessage: typeMsg,
  });
 } catch (err) {
  console.error("Erro ao concluir exercício:", err);
  View.showToast("Erro ao registar o exercício. Tenta novamente.");
  View.setCompleteEnabled(true);
 }
}

function openActivity(activityId) {
 const activity = activities.find((a) => String(a.id) === activityId);
 if (!activity) return;

 currentActivity = activity;
 View.openModal(activity);
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

 View.renderActivities(activities);
 View.bindGridClick(openActivity);
 View.bindComplete(completeExercise);
 View.bindClose(() => {
  currentActivity = null;
  View.closeModal();
 });
 View.bindXpClose(() => View.closeXpModal());
}

init();
