import { UserModel } from "../models/userModel.js";
import { StreakModel } from "../models/streakModel.js";
import { ProgressModel } from "../models/progressModel.js";
import { NotificationsModel } from "../models/notificationsModel.js";
import { apiFetch } from "../data/http.js";
import { requireSession } from "../data/session.js";

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
const dashboardMedalsGrid = document.getElementById("dashboard-medals-grid");
const achievementModal = document.getElementById("achievement-modal");
const pendingChallengesList = document.getElementById("pending-challenges-list");
const pendingMedalsList = document.getElementById("pending-medals-list");
const addAchievementBtn = document.getElementById("btn-add-achievement");
const humorChartEl = document.getElementById("humorChart");
const humorChartLegend = document.getElementById("humor-chart-legend");

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

let currentStats = null;
let humorChartInstance = null;
let currentProgress = null;
let challengeDefs = [];
let medalDefs = [];

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

function renderDashboardMedals(unlockedIds) {
 if (!dashboardMedalsGrid) return;

 const unlocked = medalDefs.filter((m) => unlockedIds.includes(m.id));

 if (unlocked.length === 0) {
  dashboardMedalsGrid.innerHTML =
   `<p class="medals-empty">Ainda sem medalhas. Completa desafios para desbloquear!</p>`;
  return;
 }

 dashboardMedalsGrid.innerHTML = unlocked
  .map(
   (m) => `
    <div class="medal">
      <div class="medal-icon" style="background:${m.color};color:${m.textColor}">${m.icon}</div>
      <div class="medal-name">${m.title}</div>
      <div class="medal-sub">${m.description}</div>
    </div>
  `,
  )
  .join("");
}

function renderStreak(stats) {
 if (streakNumber) streakNumber.textContent = stats.streak;

 if (streakLabel) {
  streakLabel.textContent =
   stats.streak === 1 ? "dia seguido" : "dias seguidos";
 }

 renderDots(stats.streak, stats.checkedInToday);

 if (checkinBtn) {
  if (stats.checkedInToday) {
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

function dateStr(date) {
 return date.toISOString().slice(0, 10);
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

function moodLegendText(avg) {
 if (avg >= 4) return "O teu humor medio foi bom esta semana.";
 if (avg >= 3) return "O teu humor medio foi equilibrado esta semana.";
 return "O teu humor foi mais baixo esta semana — cuida de ti.";
}

async function fetchMoodLogs(userId) {
 const res = await apiFetch(`/moodLogs?userId=${userId}`);
 if (!res?.ok) return [];
 return res.json();
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

 const numericValues = values.filter((v) => v !== null);
 const avg =
  numericValues.length ?
   numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length
  : 3.5;

 if (humorChartLegend) {
  humorChartLegend.textContent = moodLegendText(avg);
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
     ticks: { stepSize: 1 },
     grid: { color: "rgba(0,0,0,0.04)" },
    },
    x: { grid: { display: false } },
   },
  },
 });
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
 const [stats, progress, challenges, medals] = await Promise.all([
  StreakModel.getStats(activeUser.id),
  ProgressModel.getProgress(activeUser.id),
  ProgressModel.getChallengeDefinitions(),
  ProgressModel.getMedalDefinitions(),
 ]);

 currentStats = stats;
 currentProgress = progress;
 challengeDefs = challenges;
 medalDefs = medals;

 await Promise.all([
  ProgressModel.syncChallenges(activeUser.id, stats),
  ProgressModel.syncMedals(activeUser.id, stats),
 ]);

  currentProgress = await ProgressModel.getProgress(activeUser.id);
 renderProgress(currentProgress);
 renderDashboardMedals(currentProgress.unlockedMedals || []);
}

async function loadStreak() {
 try {
  const stats = await StreakModel.syncStreak(activeUser.id);
  currentStats = stats;
  renderStreak(stats);

  if (stats.broken) {
   showFeedback("A tua streak foi reiniciada. Começa hoje!", "warning");
  }

  await refreshProgressData();
 } catch (err) {
  console.error("Erro ao carregar streak:", err);
 }
}

checkinBtn?.addEventListener("click", async () => {
 checkinBtn.disabled = true;
 checkinBtn.textContent = "A registar…";

 try {
  const result = await StreakModel.doCheckin(activeUser.id);

  if (result.alreadyDone) {
   showFeedback("Já fizeste check-in hoje!", "warning");
  } else {
   showFeedback(
    result.streak === 1 ?
     "Check-in feito! Streak iniciada 🔥"
    : `Check-in feito! Streak: ${result.streak} dias 🔥`,
    "success",
   );
  }

  currentStats = result;
  renderStreak(result);
  UserModel.saveSession({ ...activeUser, streak: result.streak });
  await refreshProgressData();
 } catch {
  showFeedback("Erro ao registar o check-in. Tenta novamente.", "error");
  checkinBtn.disabled = false;
  checkinBtn.textContent = "Fazer check-in de hoje";
 }
});

addAchievementBtn?.addEventListener("click", openAchievementModal);

achievementModal?.querySelectorAll("[data-achievement-close]").forEach((el) => {
 el.addEventListener("click", closeAchievementModal);
});

pendingChallengesList?.addEventListener("click", async (event) => {
 const btn = event.target.closest("[data-challenge-id]");
 if (!btn || !currentStats) return;

 try {
  const result = await ProgressModel.claimChallenge(
   activeUser.id,
   btn.dataset.challengeId,
   currentStats,
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
 if (!btn || !currentStats) return;

 try {
  const result = await ProgressModel.claimMedal(
   activeUser.id,
   btn.dataset.medalId,
   currentStats,
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
  const moodLogs = await fetchMoodLogs(activeUser.id);
  renderHumorChart(moodLogs);
 } catch (err) {
  console.error("Erro ao carregar grafico de humor:", err);
  renderHumorChart([]);
 }
}

async function initDashboard() {
 activeUser = await requireSession();
 if (!activeUser) return;

 await loadStreak();
 await loadHumorChart();
}

initDashboard();
