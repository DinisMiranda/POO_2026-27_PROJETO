class AppModel {
  constructor() {
    this.STORAGE_KEYS = {
      checkIns: "zenify_check_ins",
      stats: "zenify_stats",
    };
  }

  getCheckIns() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.checkIns) || "[]");
  }

  setCheckIns(data) {
    localStorage.setItem(this.STORAGE_KEYS.checkIns, JSON.stringify(data));
  }

  getStats() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.stats) || '{"xp":0,"streak":0,"lastDate":""}');
  }

  setStats(data) {
    localStorage.setItem(this.STORAGE_KEYS.stats, JSON.stringify(data));
  }

  getRecommendation(level) {
    if (level <= 2) return "Hoje recomenda-se: 5 minutos de respiracao + caminhada leve.";
    if (level === 3) return "Hoje recomenda-se: meditacao curta e pausa digital de 20 minutos.";
    return "Bom momento para manter rotina: check-in, gratidao e desafio semanal.";
  }

  computeBadge(xp) {
    if (xp >= 150) return "Consistente";
    if (xp >= 75) return "Em progresso";
    if (xp >= 30) return "Iniciante ativo";
    return "Inicial";
  }

  sameDay(dateA, dateB) {
    return new Date(dateA).toDateString() === new Date(dateB).toDateString();
  }

  diffDays(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((a - b) / msPerDay);
  }

  addCheckIn({ level, note, today }) {
    const checkIns = this.getCheckIns();
    checkIns.push({ date: today, level, note });
    this.setCheckIns(checkIns);

    const stats = this.getStats();
    const currentDate = new Date(today);

    if (!stats.lastDate) {
      stats.streak = 1;
    } else if (!this.sameDay(today, stats.lastDate)) {
      const daysGap = this.diffDays(currentDate, new Date(stats.lastDate));
      stats.streak = daysGap === 1 ? stats.streak + 1 : 1;
    }

    stats.lastDate = today;
    stats.xp += 10;
    this.setStats(stats);

    return {
      checkIns,
      stats,
      recommendation: this.getRecommendation(level),
    };
  }

  addBreathingReward() {
    const stats = this.getStats();
    stats.xp += 5;
    this.setStats(stats);
    return stats;
  }
}
