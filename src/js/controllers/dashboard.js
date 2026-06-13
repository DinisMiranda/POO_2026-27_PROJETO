import { UserModel } from "../models/userModel.js";
import { StreakModel } from "../models/streakModel.js";
import { ProgressModel } from "../models/progressModel.js";
import { NotificationsModel } from "../models/notificationsModel.js";

const user = UserModel.getSession();
if (!user) window.location.href = "landing.html";

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

let currentStats = null;
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
  StreakModel.getStats(user.id),
  ProgressModel.getProgress(user.id),
  ProgressModel.getChallengeDefinitions(),
  ProgressModel.getMedalDefinitions(),
 ]);

 currentStats = stats;
 currentProgress = progress;
 challengeDefs = challenges;
 medalDefs = medals;

 await Promise.all([
  ProgressModel.syncChallenges(user.id, stats),
  ProgressModel.syncMedals(user.id, stats),
 ]);

 currentProgress = await ProgressModel.getProgress(user.id);
 renderProgress(currentProgress);
 renderDashboardMedals(currentProgress.unlockedMedals || []);
}

async function loadStreak() {
 try {
  const stats = await StreakModel.syncStreak(user.id);
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
  const result = await StreakModel.doCheckin(user.id);

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
  UserModel.saveSession({ ...user, streak: result.streak });
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
   user.id,
   btn.dataset.challengeId,
   currentStats,
  );

  if (result.alreadyDone) {
   showFeedback("Desafio já estava concluído.", "warning");
  } else {
   await NotificationsModel.addNotification(user.id, {
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
   user.id,
   btn.dataset.medalId,
   currentStats,
  );

  if (result.alreadyDone) {
   showFeedback("Medalha já estava desbloqueada.", "warning");
  } else {
   await NotificationsModel.addNotification(user.id, {
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

loadStreak();
