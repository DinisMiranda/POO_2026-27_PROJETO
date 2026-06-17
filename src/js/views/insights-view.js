import { t, tf } from "../data/i18n.js";

export const InsightsView = {
 avatar: document.getElementById("insight-avatar"),
 avatarText: document.getElementById("insight-avatar-text"),
 xp: document.getElementById("insight-xp"),
 xpWeek: document.getElementById("insight-xp-week"),
 streak: document.getElementById("insight-streak"),
 bestStreak: document.getElementById("insight-best-streak"),
 mood: document.getElementById("insight-mood"),
 weeklyCheckins: document.getElementById("insight-weekly-checkins"),
 weeklySessions: document.getElementById("insight-weekly-sessions"),
 checkinRate: document.getElementById("insight-checkin-rate"),
 weeklyXp: document.getElementById("insight-weekly-xp"),
 criticalPeriod: document.getElementById("insight-critical-period"),
 chart: document.getElementById("insightsChart"),
 recs: document.getElementById("insights-recs"),

 ensureRequiredElements() {
  const els = this;
  const missing = Object.entries(els)
   .filter(([key, value]) => !value && key !== "avatar" && key !== "avatarText")
   .map(([key]) => key);

  if (missing.length) {
   throw new Error(`Missing elements in insights.html: ${missing.join(", ")}`);
  }
 },

 renderSummary({
  initials,
  xp,
  weeklyXp,
  streak,
  longestStreak,
  avgMood,
  weeklyCheckins,
  weeklySessions,
  checkinRate,
  criticalPeriod,
 }) {
  if (this.avatar) this.avatar.textContent = initials;
  if (this.avatarText) this.avatarText.textContent = initials;
  this.xp.textContent = String(xp);
  this.xpWeek.textContent = tf("insights.weeklyXp", { n: weeklyXp });
  this.streak.textContent = tf("insights.streakDays", { n: streak });
  this.bestStreak.textContent = tf("insights.bestStreak", { n: longestStreak });
  this.mood.textContent = `${avgMood.toFixed(1)} / 5`;
  this.weeklyCheckins.textContent = tf("insights.checkinsOf7", { n: weeklyCheckins });
  this.weeklySessions.textContent = tf("insights.sessionsComplete", { n: weeklySessions });
  this.checkinRate.textContent = `${checkinRate}%`;
  this.weeklyXp.textContent = `+${weeklyXp} ${t("common.xp")}`;
  this.criticalPeriod.textContent = criticalPeriod;
 },

 renderRecommendations(recommendations) {
  this.recs.innerHTML = recommendations
   .map(
    (rec) => `
        <div class="list-row">
          <div>
            <strong>${rec.title}</strong><br />
            <span>${rec.text}</span>
          </div>
          <a href="exercicios.html" class="btn-secondary">${t("common.open")}</a>
        </div>
      `,
   )
   .join("");
 },

 renderChart(labels, values) {
  new Chart(this.chart, {
   type: "bar",
   data: {
    labels,
    datasets: [
     {
      data: values,
      backgroundColor: "rgba(92,186,154,0.65)",
      borderRadius: 8,
     },
    ],
   },
   options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
     y: { min: 1, max: 5, grid: { color: "rgba(0,0,0,0.04)" } },
     x: { grid: { display: false } },
    },
   },
  });
 },

 showError(message) {
  if (!this.recs) return;
  this.recs.innerHTML = `
      <div class="list-row">
        <div>
          <strong>${t("insights.loadError")}</strong><br />
          <span>${message}</span>
        </div>
      </div>
    `;
 },
};
