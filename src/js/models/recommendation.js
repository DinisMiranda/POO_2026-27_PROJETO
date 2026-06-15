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
    text: "Humor baixo à noite: respiração 4-4 (2 min) e desligar ecrãs 30 min antes de dormir.",
    rule: "humor <= 2 + noite",
   };
  }
  if (period === "manha") {
   return {
    text: "Humor baixo de manhã: 5 min de respiração + caminhada leve antes das aulas.",
    rule: "humor <= 2 + manhã",
   };
  }
  return {
   text: "Humor baixo à tarde: pausa de 10 min, água e exercício de calma na app.",
   rule: "humor <= 2 + tarde",
  };
 }

 if (level === 3) {
  return {
   text: "Humor moderado: meditação curta (5 min) e pausa digital de 20 minutos.",
   rule: "humor === 3",
  };
 }

 if (period === "noite") {
  return {
   text: "Bom humor à noite: mantém rotina leve (gratidão + preparar o dia seguinte).",
   rule: "humor >= 4 + noite",
  };
 }

 return {
  text: "Bom humor: mantém consistência com check-in diário e desafio semanal.",
  rule: "humor >= 4",
 };
}
