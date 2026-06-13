const API_BASE = "http://localhost:3000";

export const ProgressModel = {
 // Retorna (ou cria) o registo de progresso do utilizador
 async getProgress(userId) {
  const res = await fetch(`${API_BASE}/userProgress?userId=${userId}`);
  if (!res.ok) throw new Error("Erro ao obter progresso.");
  const list = await res.json();
  if (list.length > 0) return list[0];
  return await this._createProgress(userId);
 },

 async _createProgress(userId) {
  const payload = {
   userId,
   xp: 0,
   level: 1,
   totalCheckins: 0,
   longestStreak: 0,
   activityTypes: [], // tipos de atividades já feitas
   completedChallenges: [], // ids de challengeDefinitions cumpridos
   unlockedMedals: [], // ids de medalDefinitions desbloqueadas
   createdAt: new Date().toISOString(),
  };
  const res = await fetch(`${API_BASE}/userProgress`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao inicializar progresso.");
  return await res.json();
 },

 async updateProgress(progressId, data) {
  const res = await fetch(`${API_BASE}/userProgress/${progressId}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar progresso.");
  return await res.json();
 },

 async getChallengeDefinitions() {
  const res = await fetch(`${API_BASE}/challengeDefinitions`);
  if (!res.ok) throw new Error("Erro ao obter desafios.");
  return await res.json();
 },

 async getMedalDefinitions() {
  const res = await fetch(`${API_BASE}/medalDefinitions`);
  if (!res.ok) throw new Error("Erro ao obter medalhas.");
  return await res.json();
 },

 // Calcula level a partir de XP (cada 100 XP = 1 level)
 calcLevel(xp) {
  return Math.floor(xp / 100) + 1;
 },

 // Verifica se novos desafios foram cumpridos e atualiza
 async syncChallenges(userId, stats) {
  const [progress, challenges] = await Promise.all([
   this.getProgress(userId),
   this.getChallengeDefinitions(),
  ]);

  const newlyCompleted = [];
  let xpGained = 0;

  for (const c of challenges) {
   if (progress.completedChallenges.includes(c.id)) continue;

   let done = false;
   if (c.type === "checkin") done = stats.totalCheckins >= c.target;
   if (c.type === "streak") done = stats.longestStreak >= c.target;
   if (c.type === "activities")
    done = (progress.activityTypes || []).length >= c.target;

   if (done) {
    newlyCompleted.push(c.id);
    xpGained += c.xpReward;
   }
  }

  if (newlyCompleted.length === 0) return { progress, newlyCompleted: [] };

  const updatedProgress = await this.updateProgress(progress.id, {
   completedChallenges: [...progress.completedChallenges, ...newlyCompleted],
   xp: progress.xp + xpGained,
   level: this.calcLevel(progress.xp + xpGained),
  });

  return { progress: updatedProgress, newlyCompleted };
 },

 // Verifica se novas medalhas foram desbloqueadas
 async syncMedals(userId, stats) {
  const [progress, medals] = await Promise.all([
   this.getProgress(userId),
   this.getMedalDefinitions(),
  ]);

  const newlyUnlocked = [];

  for (const m of medals) {
   if (progress.unlockedMedals.includes(m.id)) continue;

   let unlocked = false;
   if (m.condition === "streak_7") unlocked = stats.longestStreak >= 7;
   if (m.condition === "streak_30") unlocked = stats.longestStreak >= 30;
   if (m.condition === "checkins_10") unlocked = stats.totalCheckins >= 10;
   if (m.condition === "checkins_50") unlocked = stats.totalCheckins >= 50;

   if (unlocked) newlyUnlocked.push(m.id);
  }

  if (newlyUnlocked.length === 0) return { progress, newlyUnlocked: [] };

  const updatedProgress = await this.updateProgress(progress.id, {
   unlockedMedals: [...progress.unlockedMedals, ...newlyUnlocked],
  });

  return { progress: updatedProgress, newlyUnlocked };
 },
};
