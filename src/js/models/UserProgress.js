import { getRecommendation } from "./recommendation.js";

// ---------------------------------------------------------------------------
// Streak award tiers
// ---------------------------------------------------------------------------
// Temporary medals (lost when streak resets):
//   >= 7  days  → 🏅 "Calm Week"
//   >= 30 days  → 🌙 "Zen Month (Nx)"   — N = floor(streak / 30)
// Permanent title (kept even after streak loss):
//   >= 365 days → ⭐ "Zenith"
// ---------------------------------------------------------------------------

export class UserProgress {
  #xp;
  #streak;
  #lastDate;
  #streakStartDate;
  #permanentTitle;

  constructor({
    xp = 0,
    streak = 0,
    lastDate = "",
    streakStartDate = "",
    permanentTitle = "",
  } = {}) {
    this.#xp = xp;
    this.#streak = streak;
    this.#lastDate = lastDate;
    this.#streakStartDate = streakStartDate;
    this.#permanentTitle = permanentTitle;
  }

  static fromJSON(data) {
    return new UserProgress(data);
  }

  toJSON() {
    return {
      xp: this.#xp,
      streak: this.#streak,
      lastDate: this.#lastDate,
      streakStartDate: this.#streakStartDate,
      permanentTitle: this.#permanentTitle,
    };
  }

  // -------------------------------------------------------------------------
  // XP badge (unchanged)
  // -------------------------------------------------------------------------
  computeBadge() {
    if (this.#xp >= 150) return "Consistente";
    if (this.#xp >= 75) return "Em progresso";
    if (this.#xp >= 30) return "Iniciante ativo";
    return "Inicial";
  }

  // -------------------------------------------------------------------------
  // Streak award — returns the current award object or null
  // Shape: { type: "medal"|"title", label: string, emoji: string, isNew: boolean }
  // -------------------------------------------------------------------------
  computeStreakAward(previousStreak = this.#streak) {
    const s = this.#streak;

    // Permanent title: once earned it is stored and always returned
    if (this.#permanentTitle) {
      return { type: "title", label: this.#permanentTitle, emoji: "⭐", isNew: false };
    }

    if (s >= 365) {
      const title = "Zenith";
      this.#permanentTitle = title;
      return { type: "title", label: title, emoji: "⭐", isNew: true };
    }

    if (s >= 30) {
      const months = Math.floor(s / 30);
      const label = `Zen Month (${months}x)`;
      const isNew = previousStreak < 30 || Math.floor(previousStreak / 30) < months;
      return { type: "medal", label, emoji: "🌙", isNew };
    }

    if (s >= 7) {
      const isNew = previousStreak < 7;
      return { type: "medal", label: "Calm Week", emoji: "🏅", isNew };
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Private date helpers
  // -------------------------------------------------------------------------
  #sameDay(dateA, dateB) {
    return new Date(dateA).toDateString() === new Date(dateB).toDateString();
  }

  #diffDays(dateA, dateB) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((new Date(dateA) - new Date(dateB)) / msPerDay);
  }

  // -------------------------------------------------------------------------
  // Check-in reward — returns { recommendation, streakAward }
  // -------------------------------------------------------------------------
  applyCheckInReward({ level, today }) {
    if (level < 1 || level > 5) {
      throw new RangeError(`level deve ser entre 1 e 5, recebido: ${level}`);
    }

    const currentDate = new Date(today);
    const previousStreak = this.#streak;

    if (!this.#lastDate) {
      // First ever check-in
      this.#streak = 1;
      this.#streakStartDate = today;
    } else if (this.#sameDay(today, this.#lastDate)) {
      // Same day — no streak change, no double-reward
    } else {
      const daysGap = this.#diffDays(currentDate, new Date(this.#lastDate));
      if (daysGap === 1) {
        // Consecutive day
        this.#streak += 1;
      } else {
        // Missed one or more days — reset streak and temporary medals
        this.#streak = 1;
        this.#streakStartDate = today;
      }
    }

    this.#lastDate = today;
    this.#xp += 10;

    // Streak bonus XP when a new milestone is hit
    const award = this.computeStreakAward(previousStreak);
    if (award?.isNew) {
      if (award.type === "title") this.#xp += 50;
      else if (award.label.startsWith("Zen Month")) this.#xp += 30;
      else this.#xp += 15; // Calm Week
    }

    const recommendation = getRecommendation(level, currentDate);
    return { recommendation, streakAward: award };
  }

  applyBreathingReward() {
    this.#xp += 5;
    return this.toJSON();
  }
}
