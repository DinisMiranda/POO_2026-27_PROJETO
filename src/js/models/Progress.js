import { getLevelTierName as resolveLevelTierName } from "../data/levelTiers.js";

function evaluateCondition(condition, progress) {
 if (!condition) return false;

 if (condition.startsWith("streak_")) {
  return (progress.longestStreak || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("checkins_")) {
  return (progress.totalCheckins || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("xp_")) {
  return (progress.xp || 0) >= Number(condition.split("_")[1]);
 }
 if (condition.startsWith("challenges_")) {
  return (
   (progress.completedChallenges || []).length >=
   Number(condition.split("_")[1])
  );
 }
 if (condition.startsWith("activities_")) {
  return (
   (progress.activityTypes || []).length >= Number(condition.split("_")[1])
  );
 }

 return false;
}

export class Progress {
 #record;

 constructor(record) {
  this.#record = { ...record };
 }

 get record() {
  return { ...this.#record };
 }

 get id() {
  return this.#record.id;
 }

 get xp() {
  return this.#record.xp || 0;
 }

 get streak() {
  return this.#record.streak || 0;
 }

 get checkedInToday() {
  return Boolean(this.#record.checkedInToday);
 }

 static calcLevel(xp) {
  return Math.floor((xp || 0) / 100) + 1;
 }

 static getXpInLevel(xp) {
  return (xp || 0) % 100;
 }

 static getLevelTierName(level) {
  return resolveLevelTierName(level);
 }

 calcLevel() {
  return Progress.calcLevel(this.xp);
 }

 getXpInLevel() {
  return Progress.getXpInLevel(this.xp);
 }

 getLevelTierName() {
  return Progress.getLevelTierName(this.calcLevel());
 }

 static getPendingAchievements(progress, challengeDefs, medalDefs) {
  const pendingChallenges = challengeDefs.filter(
   (c) => !(progress.completedChallenges || []).includes(c.id),
  );
  const pendingMedals = medalDefs.filter(
   (m) => !(progress.unlockedMedals || []).includes(m.id),
  );
  return { pendingChallenges, pendingMedals };
 }

 static getChallengeCurrent(challenge, progress) {
  if (challenge.type === "checkin") return progress?.totalCheckins || 0;
  if (challenge.type === "streak") return progress?.streak || 0;
  if (challenge.type === "activities") {
   return (progress?.activityTypes || []).length;
  }
  return 0;
 }

 static medalConditionMet(condition, progress) {
  return evaluateCondition(condition, progress);
 }
}
