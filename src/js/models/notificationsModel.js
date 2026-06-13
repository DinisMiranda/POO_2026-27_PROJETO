const API_BASE = "http://localhost:3000";

const AI_TEMPLATES = [
 {
  type: "ai",
  title: "Sugestão Zenify",
  message:
   "Notaste padrões de stress às quartas? Experimenta 5 min de respiração antes das aulas.",
 },
 {
  type: "ai",
  title: "Insight personalizado",
  message:
   "Utilizadores com streaks consistentes reportam mais foco nos estudos. Mantém o ritmo!",
 },
 {
  type: "ai",
  title: "Dica de bem-estar",
  message:
   "Uma pausa de 20 minutos sem ecrã pode melhorar o teu humor esta tarde.",
 },
];

export const NotificationsModel = {
 async getForUser(userId) {
  const [stored, progress, stats, medals, challenges] = await Promise.all([
   this._fetchStored(userId),
   this._fetch(`${API_BASE}/userProgress?userId=${userId}`),
   this._fetch(`${API_BASE}/userStats?userId=${userId}`),
   this._fetch(`${API_BASE}/medalDefinitions`),
   this._fetch(`${API_BASE}/challengeDefinitions`),
  ]);

  const progressRow = progress[0];
  const statsRow = stats[0];
  const generated = [];

  if (progressRow && statsRow) {
   for (const id of progressRow.unlockedMedals || []) {
    const medal = medals.find((m) => m.id === id);
    if (medal) {
     generated.push({
      id: `gen-medal-${id}`,
      type: "medal",
      title: "Medalha desbloqueada",
      message: `Conquistaste «${medal.title}» — ${medal.description}`,
      createdAt: progressRow.createdAt,
     });
    }
   }

   for (const id of progressRow.completedChallenges || []) {
    const challenge = challenges.find((c) => c.id === id);
    if (challenge) {
     generated.push({
      id: `gen-challenge-${id}`,
      type: "challenge",
      title: "Desafio concluído",
      message: `Completaste «${challenge.title}» (+${challenge.xpReward} XP)`,
      createdAt: progressRow.createdAt,
     });
    }
   }
  }

  const aiPick = AI_TEMPLATES[Math.floor(Math.random() * AI_TEMPLATES.length)];
  generated.push({
   id: "gen-ai-tip",
   type: "ai",
   title: aiPick.title,
   message: aiPick.message,
   createdAt: new Date().toISOString(),
  });

  const merged = [...stored, ...generated];
  return merged
   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
   .slice(0, 12);
 },

 async addNotification(userId, payload) {
  const res = await fetch(`${API_BASE}/userNotifications`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...payload,
   }),
  });
  if (!res.ok) return null;
  return await res.json();
 },

 async _fetchStored(userId) {
  const list = await this._fetch(`${API_BASE}/userNotifications?userId=${userId}`);
  return list.map((n) => ({
   id: n.id,
   type: n.type,
   title: n.title,
   message: n.message,
   createdAt: n.createdAt,
  }));
 },

 async _fetch(url) {
  try {
   const res = await fetch(url);
   if (!res.ok) return [];
   return await res.json();
  } catch {
   return [];
  }
 },
};
