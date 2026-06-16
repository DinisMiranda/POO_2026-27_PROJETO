import { dateStr } from "../data/utils.js";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function getLast7Days() {
 const days = [];
 for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - i);
  days.push({
   date: dateStr(d),
   label: DAY_LABELS[d.getDay()],
  });
 }
 return days;
}

export function resolveMentalState(moodLogs) {
 const moodByDate = new Map(
  moodLogs.map((entry) => [entry.date, Number(entry.mood)]),
 );
 const weekDays = getLast7Days();
 let values = weekDays
  .map((d) => moodByDate.get(d.date))
  .filter((v) => v != null && !Number.isNaN(v));

 if (!values.length && moodLogs.length > 0) {
  values = [...moodLogs]
   .sort((a, b) => a.date.localeCompare(b.date))
   .slice(-7)
   .map((entry) => Number(entry.mood))
   .filter((v) => !Number.isNaN(v));
 }

 if (!values.length) {
  return {
   title: "Sem dados",
   message: "Regista o teu humor para veres o estado mental.",
   score: null,
   trend: "stable",
   trendLabel: "Tendência estável",
   face: "empty",
  };
 }

 const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
 const split = Math.max(1, Math.floor(values.length / 2));
 const firstAvg = values.slice(0, split).reduce((sum, v) => sum + v, 0) / split;
 const secondSlice = values.slice(split);
 const secondAvg =
  secondSlice.length ?
   secondSlice.reduce((sum, v) => sum + v, 0) / secondSlice.length
  : firstAvg;

 let trend = "stable";
 let trendLabel = "Tendência estável";
 if (secondAvg - firstAvg > 0.15) {
  trend = "up";
  trendLabel = "A melhorar";
 } else if (firstAvg - secondAvg > 0.15) {
  trend = "down";
  trendLabel = "A descer";
 }

 let title = "Sensível";
 let message = "Esta semana foi mais exigente. Reserva um momento para ti.";
 let face = "low";

 if (avg >= 4) {
  title = "Radiante";
  message = "Estás num ótimo momento. Mantém os teus rituais de bem-estar.";
  face = "balanced";
 } else if (avg >= 3.2) {
  title = "Equilibrada";
  message = "Humor consistente esta semana. Continua assim!";
  face = "balanced";
 } else if (avg >= 2.5) {
  title = "Estável";
  message = "Pequenas pausas podem fazer a diferença no teu dia.";
  face = "calm";
 }

 return { title, message, score: avg, trend, trendLabel, face };
}
