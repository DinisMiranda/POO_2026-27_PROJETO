import { getRecommendation } from "./recommendation.js";

export class UserProgress {
  #xp;
  #streak;
  #lastDate;

  constructor({ xp = 0, streak = 0, lastDate = "" } = {}) {
    this.#xp = xp;
    this.#streak = streak;
    this.#lastDate = lastDate;
  }

  static fromJSON(data) {
    return new UserProgress(data);
  }

  toJSON() {
    return { xp: this.#xp, streak: this.#streak, lastDate: this.#lastDate };
  }

  computeBadge() {
    if (this.#xp >= 150) return "Consistente";
    if (this.#xp >= 75) return "Em progresso";
    if (this.#xp >= 30) return "Iniciante ativo";
    return "Inicial";
  }

  #sameDay(dateA, dateB) {
    return new Date(dateA).toDateString() === new Date(dateB).toDateString();
  }

  #diffDays(dateA, dateB) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((new Date(dateA) - new Date(dateB)) / msPerDay);
  }

  applyCheckInReward({ level, today }) {
    const currentDate = new Date(today);

    if (!this.#lastDate) {
      this.#streak = 1;
    } else if (!this.#sameDay(today, this.#lastDate)) {
      const daysGap = this.#diffDays(currentDate, new Date(this.#lastDate));
      this.#streak = daysGap === 1 ? this.#streak + 1 : 1;
    }

    this.#lastDate = today;
    this.#xp += 10;

    return getRecommendation(level, currentDate);
  }

  applyBreathingReward() {
    this.#xp += 5;
    return this.toJSON();
  }
}
