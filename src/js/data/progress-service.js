import { Progress } from "../models/Progress.js";
import { apiFetchJson } from "./http.js";
import { dateStr, offsetDate } from "./utils.js";

export const ProgressService = {
 async getProgress(userId) {
  const list = await apiFetchJson(`/userProgress?userId=${userId}`);
  if (list.length > 0) return list[0];
  return this._createProgress(userId);
 },

 async _createProgress(userId) {
  return apiFetchJson("/userProgress", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    userId,
    xp: 0,
    level: 1,
    streak: 0,
    lastCheckin: null,
    checkedInToday: false,
    totalCheckins: 0,
    longestStreak: 0,
    activityTypes: [],
    completedChallenges: [],
    unlockedMedals: [],
    createdAt: new Date().toISOString(),
   }),
  });
 },

 async updateProgress(progressId, data) {
  return apiFetchJson(`/userProgress/${progressId}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data),
  });
 },

 async getChallengeDefinitions() {
  return apiFetchJson("/challengeDefinitions");
 },

 async getMedalDefinitions() {
  return apiFetchJson("/medalDefinitions");
 },

 calcLevel(xp) {
  return Progress.calcLevel(xp);
 },

 getLevelTierName(level) {
  return Progress.getLevelTierName(level);
 },

 getXpInLevel(xp) {
  return Progress.getXpInLevel(xp);
 },

 async doCheckin(userId) {
  const progress = await this.getProgress(userId);
  const today = dateStr();
  const yesterday = dateStr(offsetDate(-1));

  if (progress.lastCheckin === today) {
   return { ...progress, alreadyDone: true };
  }

  const newStreak =
   progress.lastCheckin === yesterday ? (progress.streak || 0) + 1 : 1;

  const updated = await this.updateProgress(progress.id, {
   streak: newStreak,
   longestStreak: Math.max(newStreak, progress.longestStreak || 0),
   totalCheckins: (progress.totalCheckins || 0) + 1,
   lastCheckin: today,
   checkedInToday: true,
  });

  return { ...updated, alreadyDone: false };
 },

 async syncStreak(userId) {
  const progress = await this.getProgress(userId);
  const today = dateStr();
  const yesterday = dateStr(offsetDate(-1));

  if (progress.lastCheckin > today) {
   return { ...progress, checkedInToday: false, broken: false };
  }
  if (progress.lastCheckin === today) {
   return { ...progress, checkedInToday: true, broken: false };
  }
  if (progress.lastCheckin === yesterday || progress.lastCheckin === null) {
   return { ...progress, checkedInToday: false, broken: false };
  }

  if (progress.streak > 0) {
   const reset = await this.updateProgress(progress.id, {
    streak: 0,
    checkedInToday: false,
   });
   return { ...reset, broken: true };
  }

  return { ...progress, checkedInToday: false, broken: false };
 },

 async syncChallenges(userId) {
  const [progress, challenges] = await Promise.all([
   this.getProgress(userId),
   this.getChallengeDefinitions(),
  ]);

  const newlyCompleted = [];
  let xpGained = 0;

  for (const c of challenges) {
   if (progress.completedChallenges.includes(c.id)) continue;

   let done = false;
   if (c.type === "checkin") done = progress.totalCheckins >= c.target;
   if (c.type === "streak") done = progress.longestStreak >= c.target;
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
   level: Progress.calcLevel(progress.xp + xpGained),
  });

  return { progress: updatedProgress, newlyCompleted };
 },

 async syncMedals(userId) {
  const [progress, medals] = await Promise.all([
   this.getProgress(userId),
   this.getMedalDefinitions(),
  ]);

  const newlyUnlocked = [];

  for (const m of medals) {
   if (progress.unlockedMedals.includes(m.id)) continue;
   if (Progress.medalConditionMet(m.condition, progress)) {
    newlyUnlocked.push(m.id);
   }
  }

  if (newlyUnlocked.length === 0) return { progress, newlyUnlocked: [] };

  const updatedProgress = await this.updateProgress(progress.id, {
   unlockedMedals: [...progress.unlockedMedals, ...newlyUnlocked],
  });

  return { progress: updatedProgress, newlyUnlocked };
 },

 async claimChallenge(userId, challengeId) {
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
   level: Progress.calcLevel(newXp),
  });

  return { progress: updatedProgress, challenge, alreadyDone: false };
 },

 async claimMedal(userId, medalId) {
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

 async completeActivity(userId, activityType) {
  const progress = await this.getProgress(userId);
  const types = progress.activityTypes || [];
  const isNewType = !types.includes(activityType);
  const xpGain = 10;
  const newXp = progress.xp + xpGain;

  const updatedProgress = await this.updateProgress(progress.id, {
   activityTypes: isNewType ? [...types, activityType] : types,
   xp: newXp,
   level: Progress.calcLevel(newXp),
  });

  return { progress: updatedProgress, xpGain, newType: isNewType };
 },

 getPendingAchievements(progress, challengeDefs, medalDefs) {
  return Progress.getPendingAchievements(progress, challengeDefs, medalDefs);
 },

 getChallengeCurrent(challenge, progress) {
  return Progress.getChallengeCurrent(challenge, progress);
 },
};
