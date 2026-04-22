(() => {
  const session = window.AuthModel.requireAuth("user");
  if (!session) return;

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

  function refreshDashboard() {
    const checkIns = window.AppModel.getCheckIns();
    const stats = window.AppModel.getStats();
    window.AppView.renderDashboard({
      checkIns,
      stats,
      computeBadge: window.AppModel.computeBadge,
    });
  }

  window.AppView.renderUser(session);
  refreshDashboard();

  window.AppView.bindLogout(() => {
    window.AuthModel.clearSession();
    window.location.href = "login.html";
  });

  window.AppView.bindMoodSubmit(({ level, note }) => {
    const today = new Date().toISOString().split("T")[0];
    const result = window.AppModel.addCheckIn({ level, note, today });

    window.AppView.setRecommendation(result.recommendation);
    window.AppView.resetMoodForm();
    refreshDashboard();

    if (modal) {
      modal.show({
        heading: "Check-in guardado",
        message: "O teu registo foi guardado e a gamificacao foi atualizada.",
      });
    }
  });

  window.AppView.bindBreathingStart(() => {
    window.AppView.setBreathingState({
      running: true,
      status: "Inspira por 4s... expira por 4s... repete.",
    });

    setTimeout(() => {
      window.AppModel.addBreathingReward();
      refreshDashboard();
      window.AppView.setBreathingState({
        running: false,
        status: "Sessao concluida. Ganhaste +5 XP de consistencia!",
      });

      if (modal) {
        modal.show({
          heading: "Exercicio concluido",
          message: "Boa! Recebeste +5 XP por completares a sessao de respiracao.",
        });
      }
    }, 20000);
  });
})();
