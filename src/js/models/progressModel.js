import { getLevelTierName as resolveLevelTierName } from "../data/levelTiers.js";
import { API as API_BASE } from "../data/config.js";

function evaluateCondition(condition, stats, progress) {
 if (!condition) return false;

 if (condition.startsWith("streak_")) {
  return (stats.longestStreak || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("checkins_")) {
  return (stats.totalCheckins || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("xp_")) {
  return (progress.xp || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("challenges_")) {
  return (progress.completedChallenges || []).length >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("activities_")) {
  return (progress.activityTypes || []).length >= Number(condition.split("_")[1]);
 }

 return false;
}

export const ProgressModel = {
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
   activityTypes: [],
   completedChallenges: [],
   unlockedMedals: [],
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

 calcLevel(xp) {
  return Math.floor(xp / 100) + 1;
 },

 getLevelTierName(level) {
  return resolveLevelTierName(level);
 },

 getXpInLevel(xp) {
  return xp % 100;
 },

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
   if (c.type === "activities") {
    done = (progress.activityTypes || []).length >= c.target;
   }

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

 async syncMedals(userId, stats) {
  const [progress, medals] = await Promise.all([
   this.getProgress(userId),
   this.getMedalDefinitions(),
  ]);

  const newlyUnlocked = [];

  for (const m of medals) {
   if (progress.unlockedMedals.includes(m.id)) continue;
   if (evaluateCondition(m.condition, stats, progress)) {
    newlyUnlocked.push(m.id);
   }
  }

  if (newlyUnlocked.length === 0) return { progress, newlyUnlocked: [] };

  const updatedProgress = await this.updateProgress(progress.id, {
   unlockedMedals: [...progress.unlockedMedals, ...newlyUnlocked],
  });

  return { progress: updatedProgress, newlyUnlocked };
 },

 async claimChallenge(userId, challengeId, stats) {
  const [progress, challenges] = await Promise.all([
   this.getProgress(userId),
   this.getChallengeDefinitions(),
  ]);

  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) throw new Error("Desafio não encontrado.");
  if (progress.completedChallenges.includes(challengeId)) {
   return { progress, alreadyDone: true };
  }

  const newXp = progress.xp + challenge.xpReward;
  const updatedProgress = await this.updateProgress(progress.id, {
   completedChallenges: [...progress.completedChallenges, challengeId],
   xp: newXp,
   level: this.calcLevel(newXp),
  });

  return { progress: updatedProgress, challenge, alreadyDone: false };
 },

 async claimMedal(userId, medalId, stats) {
  const [progress, medals] = await Promise.all([
   this.getProgress(userId),
   this.getMedalDefinitions(),
  ]);

  const medal = medals.find((m) => m.id === medalId);
  if (!medal) throw new Error("Medalha não encontrada.");
  if (progress.unlockedMedals.includes(medalId)) {
   return { progress, alreadyDone: true };
  }

  const updatedProgress = await this.updateProgress(progress.id, {
   unlockedMedals: [...progress.unlockedMedals, medalId],
  });

  return { progress: updatedProgress, medal, alreadyDone: false };
 },

 getPendingAchievements(progress, challengeDefs, medalDefs) {
  const pendingChallenges = challengeDefs.filter(
   (c) => !(progress.completedChallenges || []).includes(c.id),
  );
  const pendingMedals = medalDefs.filter(
   (m) => !(progress.unlockedMedals || []).includes(m.id),
  );
  return { pendingChallenges, pendingMedals };
 },
};
