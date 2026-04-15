const STORAGE_KEYS = {
  checkIns: "zenify_check_ins",
  stats: "zenify_stats",
};

const moodForm = document.getElementById("moodForm");
const historyList = document.getElementById("historyList");
const recommendationText = document.getElementById("recommendationText");
const xpValue = document.getElementById("xpValue");
const streakValue = document.getElementById("streakValue");
const badgeValue = document.getElementById("badgeValue");
const breathingBtn = document.getElementById("breathingBtn");
const breathingStatus = document.getElementById("breathingStatus");
const userLabel = document.getElementById("userLabel");
const logoutBtn = document.getElementById("logoutBtn");

const session = requireAuth("user");
if (!session) {
  throw new Error("Sessao invalida para area de utilizador.");
}

const modal = window.ZenifyModals.create({
  modalId: "feedbackModal",
  titleId: "modalTitle",
  bodyId: "modalBody",
  closeId: "modalCloseBtn",
});

window.ZenifyViews.init({
  selectorButtons: "[data-view-target]",
  selectorViews: "[data-view]",
  activeClass: "bg-indigo-600",
});

userLabel.textContent = `${session.name} (${session.role})`;
logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

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

function refreshDashboard() {
  const checkIns = getCheckIns();
  const stats = getStats();

  xpValue.textContent = stats.xp;
  streakValue.textContent = stats.streak;
  badgeValue.textContent = computeBadge(stats.xp);

  historyList.innerHTML = "";
  checkIns
    .slice(-5)
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("li");
      item.className = "rounded-md bg-slate-50 p-3";
      item.textContent = `${entry.date} - humor ${entry.level}/5 - ${entry.note || "sem nota"}`;
      historyList.appendChild(item);
    });
}

moodForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(moodForm);
  const level = Number(formData.get("moodLevel"));
  const note = String(formData.get("moodNote") || "").trim();
  const today = new Date().toISOString().split("T")[0];

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

  recommendationText.textContent = getRecommendation(level);
  moodForm.reset();
  refreshDashboard();
  if (modal) {
    modal.show({
      heading: "Check-in guardado",
      message: "O teu registo foi guardado e a gamificacao foi atualizada.",
    });
  }
});

breathingBtn.addEventListener("click", () => {
  breathingBtn.disabled = true;
  breathingStatus.textContent = "Inspira por 4s... expira por 4s... repete.";

  setTimeout(() => {
    breathingStatus.textContent = "Sessao concluida. Ganhaste +5 XP de consistencia!";
    const stats = getStats();
    stats.xp += 5;
    setStats(stats);
    refreshDashboard();
    breathingBtn.disabled = false;
    if (modal) {
      modal.show({
        heading: "Exercicio concluido",
        message: "Boa! Recebeste +5 XP por completares a sessao de respiracao.",
      });
    }
  }, 20000);
});

refreshDashboard();
