import { UserModel } from "../models/userModel.js";
import { API } from "../data/config.js";
import { requireSession } from "../data/session.js";

let sessionUser = null;

const els = {
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
};

function initials(user) {
 const first = (user.firstName || "").trim();
 const last = (user.lastName || "").trim();
 if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
 if (user.name) {
  const parts = user.name.trim().split(/\s+/);
  if (parts.length >= 2)
   return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
 }
 return "ZU";
}

async function fetchJson(url) {
 const res = await fetch(url);
 if (!res.ok) throw new Error(`Erro ao obter dados: ${url}`);
 return await res.json();
}

function ensureRequiredElements() {
 const missing = Object.entries(els)
  .filter(([key, value]) => !value && key !== "avatar" && key !== "avatarText")
  .map(([key]) => key);

 if (missing.length) {
  throw new Error(`Elementos em falta no insights.html: ${missing.join(", ")}`);
 }
}

function buildRecommendations(avgMood, streak) {
 if (avgMood < 3.2) {
  return [
   {
    title: "Reforçar regulação emocional",
    text:
     "Experimenta respiração box e diário de gratidão nos dias de humor mais baixo.",
   },
   {
    title: "Rotina pós-estudo",
    text: "Cria um fecho de dia com meditação curta e menos tempo de ecrã.",
   },
  ];
 }

 if (streak >= 7) {
  return [
   {
    title: "Mantém a consistência",
    text: "Estás num bom ritmo. Continua com micro check-ins diários.",
   },
   {
    title: "Sobe a dificuldade",
    text:
     "Adiciona uma sessão de movimento consciente para diversificar hábitos.",
   },
  ];
 }

 return [
  {
   title: "Criar hábito diário",
   text: "Faz pelo menos um check-in por dia para ganhar consistência.",
  },
  {
   title: "Explorar exercícios",
   text:
    "Testa respiração, meditação e diário para perceber o que funciona melhor contigo.",
  },
 ];
}

async function initInsights() {
 sessionUser = await requireSession();
 if (!sessionUser) return;

 ensureRequiredElements();

 const [statsList, progressList, moods] = await Promise.all([
  fetchJson(`${API}/userStats?userId=${sessionUser.id}`),
  fetchJson(`${API}/userProgress?userId=${sessionUser.id}`),
  fetchJson(`${API}/moodLogs?userId=${sessionUser.id}`),
 ]);

 const stats = statsList[0] || {};
 const progress = progressList[0] || {};

 const moodValues =
  moods.length ? moods.map((m) => Number(m.mood)) : [3.0, 3.1, 3.2, 3.3];

 const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
 const totalCheckins = stats.totalCheckins ?? progress.totalCheckins ?? 0;
 const streak = stats.streak ?? sessionUser.streak ?? 0;
 const longestStreak = stats.longestStreak ?? progress.longestStreak ?? streak;
 const xp = progress.xp ?? sessionUser.xp ?? 0;
 const weeklyCheckins = Math.min(totalCheckins, 7);
 const checkinRate = Math.round((weeklyCheckins / 7) * 100);
 const weeklySessions = (progress.activityTypes || []).length;
 const weeklyXp = weeklySessions * 5;
 const criticalPeriod =
  avgMood < 3.2 ? "Quartas à tarde" : "Segundas ao fim do dia";

 if (els.avatar) els.avatar.textContent = initials(sessionUser);
 if (els.avatarText) els.avatarText.textContent = initials(sessionUser);
 els.xp.textContent = String(xp);
 els.xpWeek.textContent = `+${weeklyXp} esta semana`;
 els.streak.textContent = `${streak} dias`;
 els.bestStreak.textContent = `Melhor sequência: ${longestStreak} dias`;
 els.mood.textContent = `${avgMood.toFixed(1)} / 5`;
 els.weeklyCheckins.textContent = `${weeklyCheckins} de 7 dias`;
 els.weeklySessions.textContent = `${weeklySessions} sessões completas`;
 els.checkinRate.textContent = `${checkinRate}%`;
 els.weeklyXp.textContent = `+${weeklyXp} XP`;
 els.criticalPeriod.textContent = criticalPeriod;

 const recommendations = buildRecommendations(avgMood, streak);
 els.recs.innerHTML = recommendations
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

 const labels =
  moods.length ?
   moods.map((m) => m.date.slice(5))
  : ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];

 const values =
  moods.length ? moods.map((m) => Number(m.mood)) : [2.8, 3.1, 3.0, 3.4];

 new Chart(els.chart, {
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
}

initInsights().catch((error) => {
 console.error(error);

 const fallback = document.getElementById("insights-recs");
 if (fallback) {
  fallback.innerHTML = `
      <div class="list-row">
        <div>
          <strong>Erro ao carregar insights</strong><br />
          <span>${error.message}</span>
        </div>
      </div>
    `;
 }
});
