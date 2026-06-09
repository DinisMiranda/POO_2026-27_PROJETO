const moodForm = document.getElementById("moodForm");
const historyList = document.getElementById("historyList");
const recommendationText = document.getElementById("recommendationText");
const recommendationRule = document.getElementById("recommendationRule");
const xpValue = document.getElementById("xpValue");
const streakValue = document.getElementById("streakValue");
const badgeValue = document.getElementById("badgeValue");
const streakAwardEl = document.getElementById("streakAwardValue");
const breathingBtn = document.getElementById("breathingBtn");
const breathingStatus = document.getElementById("breathingStatus");
const userLabel = document.getElementById("userLabel");
const logoutBtn = document.getElementById("logoutBtn");
const chatForm = document.getElementById("chatForm");
const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const chatSubmitBtn = document.getElementById("chatSubmitBtn");

export function renderUser(session) {
  if (userLabel) userLabel.textContent = `${session.name} (${session.role})`;
}

export function renderDashboard({ checkIns, progress }) {
  if (!xpValue || !streakValue || !badgeValue || !historyList) return;

  const stats = progress.toJSON();
  xpValue.textContent = String(stats.xp);
  streakValue.textContent = String(stats.streak);
  badgeValue.textContent = progress.computeBadge();

  // Streak award (medal or permanent title)
  renderStreakAward(progress.computeStreakAward());

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

/**
 * Renders the streak award section.
 * @param {object|null} award - result of progress.computeStreakAward()
 */
export function renderStreakAward(award) {
  if (!streakAwardEl) return;

  if (!award) {
    streakAwardEl.textContent = "—";
    streakAwardEl.className = "text-slate-400 text-sm";
    return;
  }

  const text = `${award.emoji} ${award.label}`;

  if (award.type === "title") {
    // Permanent gold title
    streakAwardEl.textContent = text;
    streakAwardEl.className = "font-bold text-yellow-600 text-sm";
  } else if (award.label.startsWith("Zen Month")) {
    streakAwardEl.textContent = text;
    streakAwardEl.className = "font-semibold text-indigo-700 text-sm";
  } else {
    // Calm Week
    streakAwardEl.textContent = text;
    streakAwardEl.className = "font-semibold text-emerald-700 text-sm";
  }
}

export function setRecommendation({ text, rule }) {
  if (recommendationText) recommendationText.textContent = text;
  if (recommendationRule) {
    recommendationRule.textContent = rule ? `Regra aplicada: ${rule}` : "";
  }
}

export function resetMoodForm() {
  if (moodForm) moodForm.reset();
}

export function setBreathingState({ running, status }) {
  if (breathingBtn) breathingBtn.disabled = running;
  if (breathingStatus) breathingStatus.textContent = status;
}

export function bindMoodSubmit(handler) {
  if (!moodForm) return;
  moodForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(moodForm);
    handler({
      level: Number(formData.get("moodLevel")),
      note: String(formData.get("moodNote") || "").trim(),
    });
  });
}

export function bindBreathingStart(handler) {
  if (breathingBtn) breathingBtn.addEventListener("click", handler);
}

export function bindLogout(handler) {
  if (logoutBtn) logoutBtn.addEventListener("click", handler);
}

export function appendChatMessage({ author, text }) {
  if (!chatLog) return;

  const item = document.createElement("p");
  item.className = author === "user" ? "text-indigo-800" : "text-slate-700";
  item.textContent = `${author === "user" ? "Tu" : "Zenify"}: ${text}`;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

export function replaceLastChatMessage({ author, text }) {
  if (!chatLog?.lastElementChild) return;

  const item = chatLog.lastElementChild;
  item.className = author === "user" ? "text-indigo-800" : "text-slate-700";
  item.textContent = `${author === "user" ? "Tu" : "Zenify"}: ${text}`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

export function setChatPending(pending) {
  if (chatInput) chatInput.disabled = pending;
  if (chatSubmitBtn) chatSubmitBtn.disabled = pending;
}

export function bindChatSubmit(handler) {
  if (!chatForm) return;
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(chatForm);
    const message = String(formData.get("chatInput") || "").trim();
    if (!message) return;
    handler(message);
    chatForm.reset();
  });
}
