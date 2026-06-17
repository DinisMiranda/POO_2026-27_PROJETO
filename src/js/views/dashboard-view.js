import { Progress } from "../models/Progress.js";
import { getLast7Days } from "../utils/mental-state.js";
import { t, tf } from "../data/i18n.js";

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

let humorChartInstance = null;

export const DashboardView = {
 streakNumber: document.getElementById("streak-number"),
 streakLabel: document.getElementById("streak-label"),
 streakDots: document.getElementById("streak-dots"),
 checkinBtn: document.getElementById("btn-checkin"),
 checkinFeedback: document.getElementById("checkin-feedback"),
 levelTierName: document.getElementById("level-tier-name"),
 levelNumber: document.getElementById("level-number"),
 levelXpText: document.getElementById("level-xp-text"),
 dashboardXpBar: document.getElementById("dashboard-xp-bar"),
 dashboardXpLabel: document.getElementById("dashboard-xp-label"),
 achievementModal: document.getElementById("achievement-modal"),
 pendingChallengesList: document.getElementById("pending-challenges-list"),
 pendingMedalsList: document.getElementById("pending-medals-list"),
 humorChartEl: document.getElementById("humorChart"),
 mentalStateTitle: document.getElementById("mental-state-title"),
 mentalStateMessage: document.getElementById("mental-state-message"),
 mentalStateTrend: document.getElementById("mental-state-trend"),
 mentalStateScore: document.getElementById("mental-state-score"),
 mentalStateOrb: document.getElementById("mental-state-orb"),
 challengeTitle: document.getElementById("challenge-title"),
 challengeDesc: document.getElementById("challenge-desc"),
 challengeProgressFill: document.getElementById("challenge-progress-fill"),
 challengeProgressLabel: document.getElementById("challenge-progress-label"),
 challengePtsValue: document.getElementById("challenge-pts-value"),
 checkinMoodModal: document.getElementById("checkin-mood-modal"),
 checkinMoodPicker: document.getElementById("checkin-mood-picker"),
 checkinMoodLabel: document.getElementById("checkin-mood-label"),
 confirmCheckinBtn: document.getElementById("btn-confirm-checkin"),

 renderProgress(progress) {
  const xp = progress.xp || 0;
  const level = Progress.calcLevel(xp);
  const xpInLevel = Progress.getXpInLevel(xp);
  const tierName = Progress.getLevelTierName(level);

  if (this.levelTierName) this.levelTierName.textContent = tierName;
  if (this.levelNumber) this.levelNumber.textContent = `${t("common.level")} ${level}`;
  if (this.levelXpText) this.levelXpText.textContent = `${xp} XP`;
  if (this.dashboardXpBar) this.dashboardXpBar.style.width = `${xpInLevel}%`;
  if (this.dashboardXpLabel) {
   this.dashboardXpLabel.textContent = `${xpInLevel} / 100 XP · ${tierName}`;
  }
 },

 renderStreak(progress) {
  if (this.streakNumber) this.streakNumber.textContent = progress.streak;

  if (this.streakLabel) {
   this.streakLabel.textContent =
    progress.streak === 1 ? t("common.dayStreak") : t("common.daysStreak");
  }

  this.renderDots(progress.streak, progress.checkedInToday);

  if (this.checkinBtn) {
   if (progress.checkedInToday) {
    this.checkinBtn.textContent = t("dashboard.checkinDone");
    this.checkinBtn.disabled = true;
    this.checkinBtn.classList.add("btn-checkin--done");
   } else {
    this.checkinBtn.textContent = t("dashboard.checkinToday");
    this.checkinBtn.disabled = false;
    this.checkinBtn.classList.remove("btn-checkin--done");
   }
  }
 },

 renderDots(streak, checkedInToday) {
  if (!this.streakDots) return;

  const total = 7;
  this.streakDots.innerHTML = "";
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

   this.streakDots.appendChild(dot);
  }
 },

 resetCheckinMoodModal() {
  this.checkinMoodPicker?.querySelectorAll(".mood-pick").forEach((btn) => {
   btn.classList.remove("is-selected");
  });
  if (this.checkinMoodLabel) {
   this.checkinMoodLabel.textContent = t("mood.pickValue");
  }
  if (this.confirmCheckinBtn) {
   this.confirmCheckinBtn.disabled = true;
   this.confirmCheckinBtn.textContent = t("dashboard.registerCheckin");
  }
 },

 openCheckinMoodModal() {
  if (!this.checkinMoodModal) return;
  this.resetCheckinMoodModal();
  this.checkinMoodModal.hidden = false;
 },

 closeCheckinMoodModal() {
  if (!this.checkinMoodModal) return;
  this.checkinMoodModal.hidden = true;
  this.resetCheckinMoodModal();
 },

 setCheckinMoodLabel(label) {
  if (this.checkinMoodLabel) this.checkinMoodLabel.textContent = label;
 },

 setConfirmCheckinLoading(loading) {
  if (!this.confirmCheckinBtn) return;
  this.confirmCheckinBtn.disabled = loading;
  this.confirmCheckinBtn.textContent = loading ? t("common.registering") : t("dashboard.registerCheckin");
 },

 enableConfirmCheckin() {
  if (this.confirmCheckinBtn) this.confirmCheckinBtn.disabled = false;
 },

 selectMoodPick(btn) {
  this.checkinMoodPicker?.querySelectorAll(".mood-pick").forEach((pick) => {
   pick.classList.toggle("is-selected", pick === btn);
  });
 },

 renderMentalState(state) {
  if (this.mentalStateTitle) this.mentalStateTitle.textContent = state.title;
  if (this.mentalStateMessage) this.mentalStateMessage.textContent = state.message;
  if (this.mentalStateScore) {
   this.mentalStateScore.textContent =
    state.score != null ? `${state.score.toFixed(1)} / 5` : "— / 5";
  }
  if (this.mentalStateTrend) {
   this.mentalStateTrend.className = `mental-state-badge mental-state-badge--${state.trend}`;
   this.mentalStateTrend.innerHTML = `${TREND_ICONS[state.trend] || TREND_ICONS.stable} ${state.trendLabel}`;
  }
  if (this.mentalStateOrb) {
   this.mentalStateOrb.innerHTML = FACE_SVG[state.face] || FACE_SVG.empty;
  }
 },

 renderHumorChart(moodLogs) {
  const ChartLib = window.Chart;
  if (!this.humorChartEl || !ChartLib) return;

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
  }

  if (humorChartInstance) humorChartInstance.destroy();

  humorChartInstance = new ChartLib(this.humorChartEl, {
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
 },

 renderChallengeCard(challenge, progress, getChallengeCurrent) {
  if (!challenge || !progress) {
   if (this.challengeTitle) this.challengeTitle.textContent = t("dashboard.noActiveChallenges");
   if (this.challengeDesc) {
    this.challengeDesc.textContent = t("dashboard.seeProfileChallenges");
   }
   if (this.challengeProgressFill) this.challengeProgressFill.style.width = "0%";
   if (this.challengeProgressLabel) this.challengeProgressLabel.textContent = "—";
   if (this.challengePtsValue) this.challengePtsValue.textContent = `— ${t("common.pts")}`;
   return;
  }

  const current = getChallengeCurrent(challenge, progress);
  const capped = Math.min(current, challenge.target);
  const pct = Math.min((current / challenge.target) * 100, 100);
  const unit = challenge.type === "streak" ? ` ${t("common.days")}` : "";

  if (this.challengeTitle) this.challengeTitle.textContent = challenge.title;
  if (this.challengeDesc) this.challengeDesc.textContent = challenge.description;
  if (this.challengeProgressFill) this.challengeProgressFill.style.width = `${pct}%`;
  if (this.challengeProgressLabel) {
   this.challengeProgressLabel.textContent = `${capped}/${challenge.target}${unit}`;
  }
  if (this.challengePtsValue) {
   this.challengePtsValue.textContent = `${challenge.xpReward} ${t("common.pts")}`;
  }
 },

 showFeedback(message, type = "success") {
  if (!this.checkinFeedback) return;

  this.checkinFeedback.textContent = message;
  this.checkinFeedback.className = `checkin-feedback checkin-feedback--${type} visible`;

  setTimeout(() => {
   this.checkinFeedback.classList.remove("visible");
  }, 3500);
 },

 renderPendingAchievements(pendingChallenges, pendingMedals) {
  if (this.pendingChallengesList) {
   this.pendingChallengesList.innerHTML =
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
    : `<p class="achievement-empty">${t("dashboard.noPendingChallenges")}</p>`;
  }

  if (this.pendingMedalsList) {
   this.pendingMedalsList.innerHTML =
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
    : `<p class="achievement-empty">${t("dashboard.noPendingMedals")}</p>`;
  }
 },

 openAchievementModal() {
  if (!this.achievementModal) return;
  this.achievementModal.hidden = false;
 },

 closeAchievementModal() {
  if (!this.achievementModal) return;
  this.achievementModal.hidden = true;
 },

 bindCheckin(handler) {
  this.checkinBtn?.addEventListener("click", handler);
 },

 bindMoodPicker(handler) {
  this.checkinMoodPicker?.addEventListener("click", handler);
 },

 bindConfirmCheckin(handler) {
  this.confirmCheckinBtn?.addEventListener("click", handler);
 },

 bindCheckinModalClose(handler) {
  this.checkinMoodModal
   ?.querySelectorAll("[data-checkin-mood-close]")
   .forEach((el) => {
    el.addEventListener("click", handler);
   });
 },

 bindAddAchievement(handler) {
  document.getElementById("btn-add-achievement")?.addEventListener("click", handler);
 },

 bindViewChallenge(handler) {
  document.getElementById("btn-view-challenge")?.addEventListener("click", handler);
 },

 bindAchievementClose(handler) {
  this.achievementModal
   ?.querySelectorAll("[data-achievement-close]")
   .forEach((el) => {
    el.addEventListener("click", handler);
   });
 },

 bindPendingChallenges(handler) {
  this.pendingChallengesList?.addEventListener("click", handler);
 },

 bindPendingMedals(handler) {
  this.pendingMedalsList?.addEventListener("click", handler);
 },
};
