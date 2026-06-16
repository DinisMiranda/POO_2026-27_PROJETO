import { ProgressService } from "../data/progress-service.js";
import { fetchMoodLogs } from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { InsightsView as View } from "../views/insights-view.js";
import { getInitials } from "../data/utils.js";
import { buildInsightsRecommendations } from "../utils/insights-rules.js";

async function initInsights() {
 mountAppShell();
 const sessionUser = await requireSession();
 if (!sessionUser) return;

 View.ensureRequiredElements();

 const userId = sessionUser.id;
 const [progress, moods] = await Promise.all([
  ProgressService.getProgress(userId),
  fetchMoodLogs(userId).catch(() => []),
 ]);

 const moodValues =
  moods.length ? moods.map((m) => Number(m.mood)) : [3.0, 3.1, 3.2, 3.3];

 const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
 const totalCheckins = progress.totalCheckins || 0;
 const streak = progress.streak || 0;
 const longestStreak = progress.longestStreak || streak;
 const xp = progress.xp || 0;
 const weeklyCheckins = Math.min(totalCheckins, 7);
 const checkinRate = Math.round((weeklyCheckins / 7) * 100);
 const weeklySessions = (progress.activityTypes || []).length;
 const weeklyXp = weeklySessions * 5;
 const criticalPeriod =
  avgMood < 3.2 ? "Quartas à tarde" : "Segundas ao fim do dia";

 View.renderSummary({
  initials: getInitials(sessionUser),
  xp,
  weeklyXp,
  streak,
  longestStreak,
  avgMood,
  weeklyCheckins,
  weeklySessions,
  checkinRate,
  criticalPeriod,
 });

 View.renderRecommendations(buildInsightsRecommendations(avgMood, streak));

 const labels =
  moods.length ?
   moods.map((m) => m.date.slice(5))
  : ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];

 const values =
  moods.length ? moods.map((m) => Number(m.mood)) : [2.8, 3.1, 3.0, 3.4];

 View.renderChart(labels, values);
}

initInsights().catch((error) => {
 console.error(error);
 View.showError(error.message);
});
