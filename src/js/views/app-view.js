class AppView {
  getElements() {
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

  renderUser(session) {
    const { userLabel } = this.getElements();
    userLabel.textContent = `${session.name} (${session.role})`;
  }

  renderDashboard({ checkIns, stats, computeBadge }) {
    const { xpValue, streakValue, badgeValue, historyList } = this.getElements();

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

  setRecommendation(text) {
    const { recommendationText } = this.getElements();
    recommendationText.textContent = text;
  }

  resetMoodForm() {
    const { moodForm } = this.getElements();
    moodForm.reset();
  }

  setBreathingState({ running, status }) {
    const { breathingBtn, breathingStatus } = this.getElements();
    breathingBtn.disabled = running;
    breathingStatus.textContent = status;
  }

  bindMoodSubmit(handler) {
    const { moodForm } = this.getElements();
    moodForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(moodForm);
      handler({
        level: Number(formData.get("moodLevel")),
        note: String(formData.get("moodNote") || "").trim(),
      });
    });
  }

  bindBreathingStart(handler) {
    const { breathingBtn } = this.getElements();
    breathingBtn.addEventListener("click", handler);
  }

  bindLogout(handler) {
    const { logoutBtn } = this.getElements();
    logoutBtn.addEventListener("click", handler);
  }
}
