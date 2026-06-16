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
   throw new Error(`Elementos em falta no insights.html: ${missing.join(", ")}`);
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
  this.xpWeek.textContent = `+${weeklyXp} esta semana`;
  this.streak.textContent = `${streak} dias`;
  this.bestStreak.textContent = `Melhor sequência: ${longestStreak} dias`;
  this.mood.textContent = `${avgMood.toFixed(1)} / 5`;
  this.weeklyCheckins.textContent = `${weeklyCheckins} de 7 dias`;
  this.weeklySessions.textContent = `${weeklySessions} sessões completas`;
  this.checkinRate.textContent = `${checkinRate}%`;
  this.weeklyXp.textContent = `+${weeklyXp} XP`;
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
          <a href="exercicios.html" class="btn-secondary">Abrir</a>
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
          <strong>Erro ao carregar insights</strong><br />
          <span>${message}</span>
        </div>
      </div>
    `;
 },
};
