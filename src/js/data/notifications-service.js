import { apiFetch, apiFetchJson } from "./http.js";

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

export const NotificationsService = {
 async getForUser(userId) {
  const [stored, progressList, medals, challenges] = await Promise.all([
   this._fetchStored(userId),
   apiFetchJson(`/userProgress?userId=${userId}`).catch(() => []),
   apiFetchJson("/medalDefinitions").catch(() => []),
   apiFetchJson("/challengeDefinitions").catch(() => []),
  ]);

  const progress = progressList[0];
  const generated = [];

  if (progress) {
   for (const id of progress.unlockedMedals || []) {
    const medal = medals.find((m) => m.id === id);
    if (medal) {
     generated.push({
      id: `gen-medal-${id}`,
      type: "medal",
      title: "Medalha desbloqueada",
      message: `Conquistaste «${medal.title}» — ${medal.description}`,
      createdAt: progress.createdAt,
     });
    }
   }

   for (const id of progress.completedChallenges || []) {
    const challenge = challenges.find((c) => c.id === id);
    if (challenge) {
     generated.push({
      id: `gen-challenge-${id}`,
      type: "challenge",
      title: "Desafio concluído",
      message: `Completaste «${challenge.title}» (+${challenge.xpReward} XP)`,
      createdAt: progress.createdAt,
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
  const res = await apiFetch("/userNotifications", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    userId,
    read: false,
    createdAt: new Date().toISOString(),
    ...payload,
   }),
  });
  if (!res?.ok) return null;
  return res.json();
 },

 async _fetchStored(userId) {
  const list = await apiFetchJson(`/userNotifications?userId=${userId}`).catch(
   () => [],
  );
  return list.map((n) => ({
   id: n.id,
   type: n.type,
   title: n.title,
   message: n.message,
   createdAt: n.createdAt,
  }));
 },
};
