window.AppModel = (() => {
  const STORAGE_KEYS = {
    checkIns: "zenify_check_ins",
    stats: "zenify_stats",
  };

  function getCheckIns() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.checkIns) || "[]");
  }

  function setCheckIns(data) {
    localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(data));
  }

  function getStats() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) || '{"xp":0,"streak":0,"lastDate":""}');
  }

  function setStats(data) {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(data));
  }

  function getRecommendation(level) {
    if (level <= 2) return "Hoje recomenda-se: 5 minutos de respiracao + caminhada leve.";
    if (level === 3) return "Hoje recomenda-se: meditacao curta e pausa digital de 20 minutos.";
    return "Bom momento para manter rotina: check-in, gratidao e desafio semanal.";
  }

  function computeBadge(xp) {
    if (xp >= 150) return "Consistente";
    if (xp >= 75) return "Em progresso";
    if (xp >= 30) return "Iniciante ativo";
    return "Inicial";
  }

  function sameDay(dateA, dateB) {
    return new Date(dateA).toDateString() === new Date(dateB).toDateString();
  }

  function diffDays(dateA, dateB) {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((a - b) / msPerDay);
  }

  function addCheckIn({ level, note, today }) {
    const checkIns = getCheckIns();
    checkIns.push({ date: today, level, note });
    setCheckIns(checkIns);

    const stats = getStats();
    const currentDate = new Date(today);

    if (!stats.lastDate) {
      stats.streak = 1;
    } else if (!sameDay(today, stats.lastDate)) {
      const daysGap = diffDays(currentDate, new Date(stats.lastDate));
      stats.streak = daysGap === 1 ? stats.streak + 1 : 1;
    }

    stats.lastDate = today;
    stats.xp += 10;
    setStats(stats);

    return {
      checkIns,
      stats,
      recommendation: getRecommendation(level),
    };
  }

  function addBreathingReward() {
    const stats = getStats();
    stats.xp += 5;
    setStats(stats);
    return stats;
  }

  return {
    getCheckIns,
    getStats,
    computeBadge,
    addCheckIn,
    addBreathingReward,
  };
})();
