class AppController {
  constructor(authModel, appModel, appView, viewManager, modalManager) {
    this.authModel = authModel;
    this.appModel = appModel;
    this.appView = appView;
    this.viewManager = viewManager;
    this.modalManager = modalManager;
    this.modal = null;
  }

  refreshDashboard() {
    const checkIns = this.appModel.getCheckIns();
    const stats = this.appModel.getStats();
    this.appView.renderDashboard({
      checkIns,
      stats,
      computeBadge: (xp) => this.appModel.computeBadge(xp),
    });
  }

  init() {
    const session = this.authModel.requireAuth("user");
    if (!session) return;

    this.modal = this.modalManager.create({
      modalId: "feedbackModal",
      titleId: "modalTitle",
      bodyId: "modalBody",
      closeId: "modalCloseBtn",
    });

    this.viewManager.init({
      selectorButtons: "[data-view-target]",
      selectorViews: "[data-view]",
      activeClass: "bg-indigo-600",
    });

    this.appView.renderUser(session);
    this.refreshDashboard();

    this.appView.bindLogout(() => {
      this.authModel.clearSession();
      window.location.href = "login.html";
    });

    this.appView.bindMoodSubmit(({ level, note }) => {
      const today = new Date().toISOString().split("T")[0];
      const result = this.appModel.addCheckIn({ level, note, today });

      this.appView.setRecommendation(result.recommendation);
      this.appView.resetMoodForm();
      this.refreshDashboard();

      if (this.modal) {
        this.modal.show({
          heading: "Check-in guardado",
          message: "O teu registo foi guardado e a gamificacao foi atualizada.",
        });
      }
    });

    this.appView.bindBreathingStart(() => {
      this.appView.setBreathingState({
        running: true,
        status: "Inspira por 4s... expira por 4s... repete.",
      });

      setTimeout(() => {
        this.appModel.addBreathingReward();
        this.refreshDashboard();
        this.appView.setBreathingState({
          running: false,
          status: "Sessao concluida. Ganhaste +5 XP de consistencia!",
        });

        if (this.modal) {
          this.modal.show({
            heading: "Exercicio concluido",
            message: "Boa! Recebeste +5 XP por completares a sessao de respiracao.",
          });
        }
      }, 20000);
    });
  }
}

const appController = new AppController(
  new AuthModel(),
  new AppModel(),
  new AppView(),
  new ViewManager(),
  new ModalManager()
);
appController.init();
