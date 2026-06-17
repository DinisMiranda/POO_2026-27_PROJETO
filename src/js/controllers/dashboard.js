import { ProgressService } from "../data/progress-service.js";
import { NotificationsService } from "../data/notifications-service.js";
import { fetchMoodLogs, saveMoodLog } from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { DashboardView as View } from "../views/dashboard-view.js";
import { getMoodLabels } from "../data/utils.js";
import { resolveMentalState } from "../utils/mental-state.js";
import { setPageTitle, t, tf } from "../data/i18n.js";

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
   View.showFeedback(t("dashboard.alreadyCheckedIn"), "warning");
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
    t("dashboard.checkinStarted")
   : tf("dashboard.checkinDoneStreak", { n: result.streak }),
   "success",
  );
 } catch {
  View.showFeedback(t("dashboard.checkinError"), "error");
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
   View.showFeedback(t("dashboard.streakReset"), "warning");
  }

  await refreshProgressData();
 } catch (err) {
  console.error("Erro ao carregar streak:", err);
 }
}

function bindEvents() {
 View.bindCheckin(() => {
  if (currentProgress?.checkedInToday) {
   View.showFeedback(t("dashboard.alreadyCheckedIn"), "warning");
   return;
  }
  View.openCheckinMoodModal();
 });

 View.bindMoodPicker((event) => {
  const btn = event.target.closest(".mood-pick");
  if (!btn) return;

  selectedCheckinMood = Number(btn.dataset.mood);
  View.selectMoodPick(btn);
  View.setCheckinMoodLabel(getMoodLabels()[selectedCheckinMood] || "");
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
    View.showFeedback(t("dashboard.challengeAlreadyDone"), "warning");
   } else {
    await NotificationsService.addNotification(activeUser.id, {
     type: "challenge",
     title: t("dashboard.notifChallenge"),
     message: `«${result.challenge.title}» (+${result.challenge.xpReward} XP).`,
    });
    View.showFeedback(tf("dashboard.challengeAdded", { title: result.challenge.title }), "success");
   }

   await refreshProgressData();
   renderPendingAchievements();
  } catch {
   View.showFeedback(t("dashboard.challengeAddError"), "error");
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
    View.showFeedback(t("dashboard.medalAlreadyDone"), "warning");
   } else {
    await NotificationsService.addNotification(activeUser.id, {
     type: "medal",
     title: t("dashboard.notifMedal"),
     message: `«${result.medal.title}».`,
    });
    View.showFeedback(tf("dashboard.medalAdded", { title: result.medal.title }), "success");
   }

   await refreshProgressData();
   renderPendingAchievements();
  } catch {
   View.showFeedback(t("dashboard.medalAddError"), "error");
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
 setPageTitle("page.title.dashboard");
 activeUser = await requireSession();
 if (!activeUser) return;

 bindEvents();
 await loadStreak();
 await loadHumorChart();
}

initDashboard();
