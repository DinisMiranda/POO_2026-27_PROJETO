window.AppView = (() => {
  function getElements() {
    return {
      moodForm: document.getElementById("moodForm"),
      historyList: document.getElementById("historyList"),
      recommendationText: document.getElementById("recommendationText"),
      xpValue: document.getElementById("xpValue"),
      streakValue: document.getElementById("streakValue"),
      badgeValue: document.getElementById("badgeValue"),
      breathingBtn: document.getElementById("breathingBtn"),
      breathingStatus: document.getElementById("breathingStatus"),
      userLabel: document.getElementById("userLabel"),
      logoutBtn: document.getElementById("logoutBtn"),
    };
  }

  function renderUser(session) {
    const { userLabel } = getElements();
    userLabel.textContent = `${session.name} (${session.role})`;
  }

  function renderDashboard({ checkIns, stats, computeBadge }) {
    const { xpValue, streakValue, badgeValue, historyList } = getElements();

    xpValue.textContent = String(stats.xp);
    streakValue.textContent = String(stats.streak);
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

  function setRecommendation(text) {
    const { recommendationText } = getElements();
    recommendationText.textContent = text;
  }

  function resetMoodForm() {
    const { moodForm } = getElements();
    moodForm.reset();
  }

  function setBreathingState({ running, status }) {
    const { breathingBtn, breathingStatus } = getElements();
    breathingBtn.disabled = running;
    breathingStatus.textContent = status;
  }

  function bindMoodSubmit(handler) {
    const { moodForm } = getElements();
    moodForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(moodForm);
      handler({
        level: Number(formData.get("moodLevel")),
        note: String(formData.get("moodNote") || "").trim(),
      });
    });
  }

  function bindBreathingStart(handler) {
    const { breathingBtn } = getElements();
    breathingBtn.addEventListener("click", handler);
  }

  function bindLogout(handler) {
    const { logoutBtn } = getElements();
    logoutBtn.addEventListener("click", handler);
  }

  return {
    renderUser,
    renderDashboard,
    setRecommendation,
    resetMoodForm,
    setBreathingState,
    bindMoodSubmit,
    bindBreathingStart,
    bindLogout,
  };
})();
