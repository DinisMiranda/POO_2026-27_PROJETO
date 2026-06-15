import { ProgressModel } from "../models/progressModel.js";
import { NotificationsModel } from "../models/notificationsModel.js";
import { fetchMoodLogs, saveMoodLog } from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { dateStr, MOOD_LABELS } from "../data/utils.js";

let activeUser = null;

const streakNumber = document.getElementById("streak-number");
const streakLabel = document.getElementById("streak-label");
const streakDots = document.getElementById("streak-dots");
const checkinBtn = document.getElementById("btn-checkin");
const checkinFeedback = document.getElementById("checkin-feedback");
const levelTierName = document.getElementById("level-tier-name");
const levelNumber = document.getElementById("level-number");
const levelXpText = document.getElementById("level-xp-text");
const dashboardXpBar = document.getElementById("dashboard-xp-bar");
const dashboardXpLabel = document.getElementById("dashboard-xp-label");
const achievementModal = document.getElementById("achievement-modal");
const pendingChallengesList = document.getElementById("pending-challenges-list");
const pendingMedalsList = document.getElementById("pending-medals-list");
const addAchievementBtn = document.getElementById("btn-add-achievement");
const humorChartEl = document.getElementById("humorChart");
const mentalStateTitle = document.getElementById("mental-state-title");
const mentalStateMessage = document.getElementById("mental-state-message");
const mentalStateTrend = document.getElementById("mental-state-trend");
const mentalStateScore = document.getElementById("mental-state-score");
const mentalStateOrb = document.getElementById("mental-state-orb");
const challengeTitle = document.getElementById("challenge-title");
const challengeDesc = document.getElementById("challenge-desc");
const challengeProgressFill = document.getElementById("challenge-progress-fill");
const challengeProgressLabel = document.getElementById("challenge-progress-label");
const challengePtsValue = document.getElementById("challenge-pts-value");
const viewChallengeBtn = document.getElementById("btn-view-challenge");
const checkinMoodModal = document.getElementById("checkin-mood-modal");
const checkinMoodPicker = document.getElementById("checkin-mood-picker");
const checkinMoodLabel = document.getElementById("checkin-mood-label");
const confirmCheckinBtn = document.getElementById("btn-confirm-checkin");

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

let currentProgress = null;
let challengeDefs = [];
let medalDefs = [];
let selectedCheckinMood = null;
let humorChartInstance = null;

function renderProgress(progress) {
 const xp = progress.xp || 0;
 const level = ProgressModel.calcLevel(xp);
 const xpInLevel = ProgressModel.getXpInLevel(xp);
 const tierName = ProgressModel.getLevelTierName(level);

 if (levelTierName) levelTierName.textContent = tierName;
 if (levelNumber) levelNumber.textContent = `Nível ${level}`;
 if (levelXpText) levelXpText.textContent = `${xp} XP`;
 if (dashboardXpBar) dashboardXpBar.style.width = `${xpInLevel}%`;
 if (dashboardXpLabel) {
  dashboardXpLabel.textContent = `${xpInLevel} / 100 XP · ${tierName}`;
 }
}

function renderStreak(progress) {
 if (streakNumber) streakNumber.textContent = progress.streak;

 if (streakLabel) {
  streakLabel.textContent =
   progress.streak === 1 ? "dia seguido" : "dias seguidos";
 }

 renderDots(progress.streak, progress.checkedInToday);

 if (checkinBtn) {
  if (progress.checkedInToday) {
   checkinBtn.textContent = "✓ Check-in feito hoje";
   checkinBtn.disabled = true;
   checkinBtn.classList.add("btn-checkin--done");
  } else {
   checkinBtn.textContent = "Fazer check-in de hoje";
   checkinBtn.disabled = false;
   checkinBtn.classList.remove("btn-checkin--done");
  }
 }
}

function renderDots(streak, checkedInToday) {
 if (!streakDots) return;

 const total = 7;
 streakDots.innerHTML = "";
 const filledCount = Math.min(streak, total);

 for (let i = 0; i < total; i++) {
  const dot = document.createElement("div");

  if (i < filledCount) {
   dot.className = "dot dot-filled";
   if (checkedInToday && i === filledCount - 1) {
    dot.classList.add("dot-today");
   }
   dot.innerHTML = `
        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2">
          <polyline points="2,6 5,9 10,3"></polyline>
        </svg>
      `;
  } else {
   dot.className = "dot dot-empty";
  }

  streakDots.appendChild(dot);
 }
}

function getLast7Days() {
 const days = [];
 for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - i);
  days.push({
   date: dateStr(d),
   label: DAY_LABELS[d.getDay()],
  });
 }
 return days;
}

function resetCheckinMoodModal() {
 selectedCheckinMood = null;
 checkinMoodPicker?.querySelectorAll(".mood-pick").forEach((btn) => {
  btn.classList.remove("is-selected");
 });
 if (checkinMoodLabel) {
  checkinMoodLabel.textContent = "Escolhe um valor de 1 a 5";
 }
 if (confirmCheckinBtn) {
  confirmCheckinBtn.disabled = true;
  confirmCheckinBtn.textContent = "Registar check-in";
 }
}

function openCheckinMoodModal() {
 if (!checkinMoodModal) return;
 resetCheckinMoodModal();
 checkinMoodModal.hidden = false;
}

function closeCheckinMoodModal() {
 if (!checkinMoodModal) return;
 checkinMoodModal.hidden = true;
 resetCheckinMoodModal();
}

async function refreshMoodDisplay() {
 const moodLogs = await fetchMoodLogs(activeUser.id);
 renderMentalState(moodLogs);
 renderHumorChart(moodLogs);
}

async function completeCheckinWithMood(mood) {
 if (!activeUser || mood == null) return;

 confirmCheckinBtn.disabled = true;
 confirmCheckinBtn.textContent = "A registar…";

 try {
  const result = await ProgressModel.doCheckin(activeUser.id);

  if (result.alreadyDone) {
   showFeedback("Já fizeste check-in hoje!", "warning");
   closeCheckinMoodModal();
   return;
  }

  await saveMoodLog(activeUser.id, mood);

  currentProgress = result;
  renderStreak(result);
  await refreshProgressData();
  await refreshMoodDisplay();

  closeCheckinMoodModal();
  showFeedback(
   result.streak === 1 ?
    "Check-in feito! Streak iniciada 🔥"
   : `Check-in feito! Streak: ${result.streak} dias 🔥`,
   "success",
  );
 } catch {
  showFeedback("Erro ao registar o check-in. Tenta novamente.", "error");
  if (confirmCheckinBtn) {
   confirmCheckinBtn.disabled = selectedCheckinMood === null;
   confirmCheckinBtn.textContent = "Registar check-in";
  }
 }
}

const FACE_SVG = {
 balanced: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="28" stroke-width="1.5"/><path d="M17 26 Q21 22 25 26" stroke-width="2"/><path d="M35 26 Q39 22 43 26" stroke-width="2"/><path d="M22 36 Q30 42 38 36"/></svg>`,
 calm: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="28" stroke-width="1.5"/><path d="M18 27 L24 27" stroke-width="2"/><path d="M36 27 L42 27" stroke-width="2"/><path d="M24 38 Q30 41 36 38"/></svg>`,
 low: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="28" stroke-width="1.5"/><path d="M18 28 Q22 24 26 28" stroke-width="2"/><path d="M34 28 Q38 24 42 28" stroke-width="2"/><path d="M24 40 Q30 36 36 40"/></svg>`,
 empty: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="28" stroke-width="1.5"/><path d="M18 27 L24 27" stroke-width="2"/><path d="M36 27 L42 27" stroke-width="2"/><path d="M24 37 L36 37"/></svg>`,
};

const TREND_ICONS = {
 up: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M2 11 L6 7 L9 9 L14 3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 down: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M2 4 L6 8 L9 6 L14 12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 stable: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M2 8 L14 8" stroke-linecap="round"/></svg>`,
};

function resolveMentalState(moodLogs) {
 const moodByDate = new Map(
  moodLogs.map((entry) => [entry.date, Number(entry.mood)]),
 );
 const weekDays = getLast7Days();
 let values = weekDays
  .map((d) => moodByDate.get(d.date))
  .filter((v) => v != null && !Number.isNaN(v));

 if (!values.length && moodLogs.length > 0) {
  values = [...moodLogs]
   .sort((a, b) => a.date.localeCompare(b.date))
   .slice(-7)
   .map((entry) => Number(entry.mood))
   .filter((v) => !Number.isNaN(v));
 }

 if (!values.length) {
  values = [3.2, 3.4, 3.6, 3.5, 3.8, 3.9, 3.7];
 }

 const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
 const split = Math.max(1, Math.floor(values.length / 2));
 const firstAvg =
  values.slice(0, split).reduce((sum, v) => sum + v, 0) / split;
 const secondSlice = values.slice(split);
 const secondAvg =
  secondSlice.length ?
   secondSlice.reduce((sum, v) => sum + v, 0) / secondSlice.length
  : firstAvg;

 let trend = "stable";
 let trendLabel = "Tendência estável";
 if (secondAvg - firstAvg > 0.15) {
  trend = "up";
  trendLabel = "A melhorar";
 } else if (firstAvg - secondAvg > 0.15) {
  trend = "down";
  trendLabel = "A descer";
 }

 let title = "Sensível";
 let message = "Esta semana foi mais exigente. Reserva um momento para ti.";
 let face = "low";

 if (avg >= 4) {
  title = "Radiante";
  message = "Estás num ótimo momento. Mantém os teus rituais de bem-estar.";
  face = "balanced";
 } else if (avg >= 3.2) {
  title = "Equilibrada";
  message = "Humor consistente esta semana. Continua assim!";
  face = "balanced";
 } else if (avg >= 2.5) {
  title = "Estável";
  message = "Pequenas pausas podem fazer a diferença no teu dia.";
  face = "calm";
 }

 return { title, message, score: avg, trend, trendLabel, face };
}

function renderMentalState(moodLogs) {
 const state = resolveMentalState(moodLogs);

 if (mentalStateTitle) mentalStateTitle.textContent = state.title;
 if (mentalStateMessage) mentalStateMessage.textContent = state.message;
 if (mentalStateScore) {
  mentalStateScore.textContent =
   state.score != null ? `${state.score.toFixed(1)} / 5` : "— / 5";
 }
 if (mentalStateTrend) {
  mentalStateTrend.className = `mental-state-badge mental-state-badge--${state.trend}`;
  mentalStateTrend.innerHTML = `${TREND_ICONS[state.trend] || TREND_ICONS.stable} ${state.trendLabel}`;
 }
 if (mentalStateOrb) {
  mentalStateOrb.innerHTML = FACE_SVG[state.face] || FACE_SVG.empty;
 }
}

function renderHumorChart(moodLogs) {
 const ChartLib = window.Chart;
 if (!humorChartEl || !ChartLib) return;

 const moodByDate = new Map(
  moodLogs.map((entry) => [entry.date, Number(entry.mood)]),
 );

 const weekDays = getLast7Days();
 let labels = weekDays.map((d) => d.label);
 let values = weekDays.map((d) => moodByDate.get(d.date) ?? null);

 const hasWeekData = values.some((v) => v !== null);

 if (!hasWeekData && moodLogs.length > 0) {
  const recent = [...moodLogs]
   .sort((a, b) => a.date.localeCompare(b.date))
   .slice(-7);
  labels = recent.map((entry) => entry.date.slice(5));
  values = recent.map((entry) => Number(entry.mood));
 } else if (!hasWeekData) {
  labels = weekDays.map((d) => d.label);
  values = [3.2, 3.4, 3.6, 3.5, 3.8, 4.0, 3.9];
 }

 if (humorChartInstance) {
  humorChartInstance.destroy();
 }

 humorChartInstance = new ChartLib(humorChartEl, {
  type: "line",
  data: {
   labels,
   datasets: [
    {
     data: values,
     borderColor: "#7577d8",
     backgroundColor: "rgba(117, 119, 216, 0.12)",
     pointBackgroundColor: "#7577d8",
     pointBorderColor: "#fff",
     pointBorderWidth: 2,
     pointRadius: 4,
     pointHoverRadius: 5,
     fill: true,
     tension: 0.35,
     spanGaps: true,
    },
   ],
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   plugins: { legend: { display: false } },
   scales: {
    y: {
     min: 1,
     max: 5,
     ticks: { display: false },
     grid: { display: false },
     border: { display: false },
    },
    x: {
     grid: { display: false },
     border: { display: false },
    },
   },
  },
 });
}

function getChallengeCurrent(challenge, progress) {
 return ProgressModel.getChallengeCurrent(challenge, progress);
}

function getActiveChallenge() {
 if (!currentProgress || !challengeDefs.length) return null;

 const pending = challengeDefs.filter(
  (c) => !currentProgress.completedChallenges.includes(c.id),
 );
 if (!pending.length) return null;

 return pending.reduce((best, c) => {
  const bestRatio =
   getChallengeCurrent(best, currentProgress) / best.target;
  const ratio = getChallengeCurrent(c, currentProgress) / c.target;
  return ratio > bestRatio ? c : best;
 });
}

function renderChallengeCard() {
 const challenge = getActiveChallenge();

 if (!challenge || !currentProgress) {
  if (challengeTitle) challengeTitle.textContent = "Sem desafios ativos";
  if (challengeDesc) {
   challengeDesc.textContent = "Vê todos os desafios no teu perfil.";
  }
  if (challengeProgressFill) challengeProgressFill.style.width = "0%";
  if (challengeProgressLabel) challengeProgressLabel.textContent = "—";
  if (challengePtsValue) challengePtsValue.textContent = "— pts";
  return;
 }

 const current = getChallengeCurrent(challenge, currentProgress);
 const capped = Math.min(current, challenge.target);
 const pct = Math.min((current / challenge.target) * 100, 100);
 const unit = challenge.type === "streak" ? " dias" : "";

 if (challengeTitle) challengeTitle.textContent = challenge.title;
 if (challengeDesc) challengeDesc.textContent = challenge.description;
 if (challengeProgressFill) challengeProgressFill.style.width = `${pct}%`;
 if (challengeProgressLabel) {
  challengeProgressLabel.textContent = `${capped}/${challenge.target}${unit}`;
 }
 if (challengePtsValue) challengePtsValue.textContent = `${challenge.xpReward} pts`;
}

function showFeedback(message, type = "success") {
 if (!checkinFeedback) return;

 checkinFeedback.textContent = message;
 checkinFeedback.className = `checkin-feedback checkin-feedback--${type} visible`;

 setTimeout(() => {
  checkinFeedback.classList.remove("visible");
 }, 3500);
}

function renderPendingAchievements() {
 if (!currentProgress) return;

 const { pendingChallenges, pendingMedals } =
  ProgressModel.getPendingAchievements(currentProgress, challengeDefs, medalDefs);

 if (pendingChallengesList) {
  pendingChallengesList.innerHTML =
   pendingChallenges.length ?
    pendingChallenges
     .map(
      (c) => `
      <button type="button" class="achievement-pick" data-challenge-id="${c.id}">
        <span>${c.icon} ${c.title}</span>
        <small>+${c.xpReward} XP</small>
      </button>
    `,
     )
     .join("")
   : `<p class="achievement-empty">Sem desafios pendentes.</p>`;
 }

 if (pendingMedalsList) {
  pendingMedalsList.innerHTML =
   pendingMedals.length ?
    pendingMedals
     .map(
      (m) => `
      <button type="button" class="achievement-pick" data-medal-id="${m.id}">
        <span>${m.icon} ${m.title}</span>
        <small>${m.description}</small>
      </button>
    `,
     )
     .join("")
   : `<p class="achievement-empty">Sem medalhas pendentes.</p>`;
 }
}

function openAchievementModal() {
 if (!achievementModal) return;
 achievementModal.hidden = false;
 renderPendingAchievements();
}

function closeAchievementModal() {
 if (!achievementModal) return;
 achievementModal.hidden = true;
}

async function refreshProgressData() {
 const [progress, challenges, medals] = await Promise.all([
  ProgressModel.getProgress(activeUser.id),
  ProgressModel.getChallengeDefinitions(),
  ProgressModel.getMedalDefinitions(),
 ]);

 currentProgress = progress;
 challengeDefs = challenges;
 medalDefs = medals;

 await Promise.all([
  ProgressModel.syncChallenges(activeUser.id),
  ProgressModel.syncMedals(activeUser.id),
 ]);

 currentProgress = await ProgressModel.getProgress(activeUser.id);
 renderProgress(currentProgress);
 renderStreak(currentProgress);
 renderChallengeCard();
}

async function loadStreak() {
 try {
  const progress = await ProgressModel.syncStreak(activeUser.id);
  currentProgress = progress;
  renderStreak(progress);

  if (progress.broken) {
   showFeedback("A tua streak foi reiniciada. Começa hoje!", "warning");
  }

  await refreshProgressData();
 } catch (err) {
  console.error("Erro ao carregar streak:", err);
 }
}

checkinBtn?.addEventListener("click", () => {
 if (currentProgress?.checkedInToday) {
  showFeedback("Já fizeste check-in hoje!", "warning");
  return;
 }
 openCheckinMoodModal();
});

checkinMoodPicker?.addEventListener("click", (event) => {
 const btn = event.target.closest(".mood-pick");
 if (!btn) return;

 selectedCheckinMood = Number(btn.dataset.mood);
 checkinMoodPicker.querySelectorAll(".mood-pick").forEach((pick) => {
  pick.classList.toggle("is-selected", pick === btn);
 });
 if (checkinMoodLabel) {
  checkinMoodLabel.textContent = MOOD_LABELS[selectedCheckinMood] || "";
 }
 if (confirmCheckinBtn) confirmCheckinBtn.disabled = false;
});

confirmCheckinBtn?.addEventListener("click", () => {
 completeCheckinWithMood(selectedCheckinMood);
});

checkinMoodModal?.querySelectorAll("[data-checkin-mood-close]").forEach((el) => {
 el.addEventListener("click", closeCheckinMoodModal);
});

addAchievementBtn?.addEventListener("click", openAchievementModal);

viewChallengeBtn?.addEventListener("click", () => {
 window.location.href = "perfil.html#desafios";
});

achievementModal?.querySelectorAll("[data-achievement-close]").forEach((el) => {
 el.addEventListener("click", closeAchievementModal);
});

pendingChallengesList?.addEventListener("click", async (event) => {
 const btn = event.target.closest("[data-challenge-id]");
 if (!btn || !currentProgress) return;

 try {
  const result = await ProgressModel.claimChallenge(
   activeUser.id,
   btn.dataset.challengeId,
  );

  if (result.alreadyDone) {
   showFeedback("Desafio já estava concluído.", "warning");
  } else {
   await NotificationsModel.addNotification(activeUser.id, {
    type: "challenge",
    title: "Desafio registado",
    message: `Adicionaste «${result.challenge.title}» (+${result.challenge.xpReward} XP).`,
   });
   showFeedback(`Desafio «${result.challenge.title}» adicionado!`, "success");
  }

  await refreshProgressData();
  renderPendingAchievements();
 } catch {
  showFeedback("Erro ao adicionar desafio.", "error");
 }
});

pendingMedalsList?.addEventListener("click", async (event) => {
 const btn = event.target.closest("[data-medal-id]");
 if (!btn || !currentProgress) return;

 try {
  const result = await ProgressModel.claimMedal(
   activeUser.id,
   btn.dataset.medalId,
  );

  if (result.alreadyDone) {
   showFeedback("Medalha já estava desbloqueada.", "warning");
  } else {
   await NotificationsModel.addNotification(activeUser.id, {
    type: "medal",
    title: "Medalha registada",
    message: `Adicionaste «${result.medal.title}».`,
   });
   showFeedback(`Medalha «${result.medal.title}» adicionada!`, "success");
  }

  await refreshProgressData();
  renderPendingAchievements();
 } catch {
  showFeedback("Erro ao adicionar medalha.", "error");
 }
});

async function loadHumorChart() {
 try {
  await refreshMoodDisplay();
 } catch (err) {
  console.error("Erro ao carregar grafico de humor:", err);
  renderMentalState([]);
  renderHumorChart([]);
 }
}

async function initDashboard() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 await loadStreak();
 await loadHumorChart();
}

initDashboard();
