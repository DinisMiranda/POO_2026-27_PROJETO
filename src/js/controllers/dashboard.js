import { ProgressService } from "../data/progress-service.js";
import { NotificationsService } from "../data/notifications-service.js";
import { fetchMoodLogs, saveMoodLog } from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { DashboardView as View } from "../views/dashboard-view.js";
import { MOOD_LABELS } from "../data/utils.js";
import { resolveMentalState } from "../utils/mental-state.js";

let activeUser = null;
let currentProgress = null;
let challengeDefs = [];
let medalDefs = [];
let selectedCheckinMood = null;

function getActiveChallenge() {
 if (!currentProgress || !challengeDefs.length) return null;

 const pending = challengeDefs.filter(
  (c) => !currentProgress.completedChallenges.includes(c.id),
 );
 if (!pending.length) return null;

 return pending.reduce((best, c) => {
  const bestRatio =
   ProgressService.getChallengeCurrent(best, currentProgress) / best.target;
  const ratio =
   ProgressService.getChallengeCurrent(c, currentProgress) / c.target;
  return ratio > bestRatio ? c : best;
 });
}

function renderChallengeCard() {
 View.renderChallengeCard(
  getActiveChallenge(),
  currentProgress,
  ProgressService.getChallengeCurrent,
 );
}

function renderPendingAchievements() {
 if (!currentProgress) return;

 const { pendingChallenges, pendingMedals } =
  ProgressService.getPendingAchievements(
   currentProgress,
   challengeDefs,
   medalDefs,
  );

 View.renderPendingAchievements(pendingChallenges, pendingMedals);
}

async function refreshMoodDisplay() {
 const moodLogs = await fetchMoodLogs(activeUser.id);
 View.renderMentalState(resolveMentalState(moodLogs));
 View.renderHumorChart(moodLogs);
}

async function refreshProgressData() {
 const [progress, challenges, medals] = await Promise.all([
  ProgressService.getProgress(activeUser.id),
  ProgressService.getChallengeDefinitions(),
  ProgressService.getMedalDefinitions(),
 ]);

 currentProgress = progress;
 challengeDefs = challenges;
 medalDefs = medals;

 await Promise.all([
  ProgressService.syncChallenges(activeUser.id),
  ProgressService.syncMedals(activeUser.id),
 ]);

 currentProgress = await ProgressService.getProgress(activeUser.id);
 View.renderProgress(currentProgress);
 View.renderStreak(currentProgress);
 renderChallengeCard();
}

async function completeCheckinWithMood(mood) {
 if (!activeUser || mood == null) return;

 View.setConfirmCheckinLoading(true);

 try {
  const result = await ProgressService.doCheckin(activeUser.id);

  if (result.alreadyDone) {
   View.showFeedback("Já fizeste check-in hoje!", "warning");
   View.closeCheckinMoodModal();
   return;
  }

  await saveMoodLog(activeUser.id, mood);

  currentProgress = result;
  View.renderStreak(result);
  await refreshProgressData();
  await refreshMoodDisplay();

  View.closeCheckinMoodModal();
  View.showFeedback(
   result.streak === 1 ?
    "Check-in feito! Streak iniciada 🔥"
   : `Check-in feito! Streak: ${result.streak} dias 🔥`,
   "success",
  );
 } catch {
  View.showFeedback("Erro ao registar o check-in. Tenta novamente.", "error");
  View.setConfirmCheckinLoading(false);
  if (selectedCheckinMood !== null) View.enableConfirmCheckin();
 }
}

async function loadStreak() {
 try {
  const progress = await ProgressService.syncStreak(activeUser.id);
  currentProgress = progress;
  View.renderStreak(progress);

  if (progress.broken) {
   View.showFeedback("A tua streak foi reiniciada. Começa hoje!", "warning");
  }

  await refreshProgressData();
 } catch (err) {
  console.error("Erro ao carregar streak:", err);
 }
}

function bindEvents() {
 View.bindCheckin(() => {
  if (currentProgress?.checkedInToday) {
   View.showFeedback("Já fizeste check-in hoje!", "warning");
   return;
  }
  View.openCheckinMoodModal();
 });

 View.bindMoodPicker((event) => {
  const btn = event.target.closest(".mood-pick");
  if (!btn) return;

  selectedCheckinMood = Number(btn.dataset.mood);
  View.selectMoodPick(btn);
  View.setCheckinMoodLabel(MOOD_LABELS[selectedCheckinMood] || "");
  View.enableConfirmCheckin();
 });

 View.bindConfirmCheckin(() => {
  completeCheckinWithMood(selectedCheckinMood);
 });

 View.bindCheckinModalClose(() => View.closeCheckinMoodModal());

 View.bindAddAchievement(() => {
  View.openAchievementModal();
  renderPendingAchievements();
 });

 View.bindViewChallenge(() => {
  window.location.href = "perfil.html#desafios";
 });

 View.bindAchievementClose(() => View.closeAchievementModal());

 View.bindPendingChallenges(async (event) => {
  const btn = event.target.closest("[data-challenge-id]");
  if (!btn || !currentProgress) return;

  try {
   const result = await ProgressService.claimChallenge(
    activeUser.id,
    btn.dataset.challengeId,
   );

   if (result.alreadyDone) {
    View.showFeedback("Desafio já estava concluído.", "warning");
   } else {
    await NotificationsService.addNotification(activeUser.id, {
     type: "challenge",
     title: "Desafio registado",
     message: `Adicionaste «${result.challenge.title}» (+${result.challenge.xpReward} XP).`,
    });
    View.showFeedback(`Desafio «${result.challenge.title}» adicionado!`, "success");
   }

   await refreshProgressData();
   renderPendingAchievements();
  } catch {
   View.showFeedback("Erro ao adicionar desafio.", "error");
  }
 });

 View.bindPendingMedals(async (event) => {
  const btn = event.target.closest("[data-medal-id]");
  if (!btn || !currentProgress) return;

  try {
   const result = await ProgressService.claimMedal(
    activeUser.id,
    btn.dataset.medalId,
   );

   if (result.alreadyDone) {
    View.showFeedback("Medalha já estava desbloqueada.", "warning");
   } else {
    await NotificationsService.addNotification(activeUser.id, {
     type: "medal",
     title: "Medalha registada",
     message: `Adicionaste «${result.medal.title}».`,
    });
    View.showFeedback(`Medalha «${result.medal.title}» adicionada!`, "success");
   }

   await refreshProgressData();
   renderPendingAchievements();
  } catch {
   View.showFeedback("Erro ao adicionar medalha.", "error");
  }
 });
}

async function loadHumorChart() {
 try {
  await refreshMoodDisplay();
 } catch (err) {
  console.error("Erro ao carregar grafico de humor:", err);
  View.renderMentalState(resolveMentalState([]));
  View.renderHumorChart([]);
 }
}

async function initDashboard() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 bindEvents();
 await loadStreak();
 await loadHumorChart();
}

initDashboard();
