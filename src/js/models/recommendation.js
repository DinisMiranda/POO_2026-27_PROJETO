export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

export function getRecommendation(level, date = new Date()) {
  const period = getTimeOfDay(date);

  if (level <= 2) {
    if (period === "noite") {
      return {
        text: "Humor baixo a noite: respiracao 4-4 (2 min) e desligar ecras 30 min antes de dormir.",
        rule: "humor <= 2 + noite",
      };
    }
    if (period === "manha") {
      return {
        text: "Humor baixo de manha: 5 min de respiracao + caminhada leve antes das aulas.",
        rule: "humor <= 2 + manha",
      };
    }
    return {
      text: "Humor baixo a tarde: pausa de 10 min, agua e exercicio de calma na app.",
      rule: "humor <= 2 + tarde",
    };
  }

  if (level === 3) {
    return {
      text: "Humor moderado: meditacao curta (5 min) e pausa digital de 20 minutos.",
      rule: "humor === 3",
    };
  }

  if (period === "noite") {
    return {
      text: "Bom humor a noite: mantem rotina leve (gratidao + preparar o dia seguinte).",
      rule: "humor >= 4 + noite",
    };
  }

  return {
    text: "Bom humor: mantem consistencia com check-in diario e desafio semanal.",
    rule: "humor >= 4",
  };
}
