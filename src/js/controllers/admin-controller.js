class AdminController {
  constructor(authModel, adminModel, adminView, viewManager, modalManager) {
    this.authModel = authModel;
    this.adminModel = adminModel;
    this.adminView = adminView;
    this.viewManager = viewManager;
    this.modalManager = modalManager;
    this.modal = null;
  }

  refreshActivities() {
    const activities = this.adminModel.getActivities();
    this.adminView.renderActivities(activities);
  }

  init() {
    const session = this.authModel.requireAuth("admin");
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

    this.adminView.renderUser(session);
    this.refreshActivities();

    this.adminView.bindLogout(() => {
      this.authModel.clearSession();
      window.location.href = "login.html";
    });

    this.adminView.bindCreate(({ title, type }) => {
      if (!title) return;
      this.adminModel.addActivity({ title, type });
      this.adminView.resetForm();
      this.refreshActivities();

      if (this.modal) {
        this.modal.show({
          heading: "Atividade criada",
          message: "A nova atividade foi adicionada com sucesso.",
        });
      }
    });

    this.adminView.bindRemove((id) => {
      this.adminModel.removeActivity(id);
      this.refreshActivities();

      if (this.modal) {
        this.modal.show({
          heading: "Atividade removida",
          message: "A atividade selecionada foi removida da lista.",
        });
      }
    });
  }
}

const adminController = new AdminController(
  new AuthModel(),
  new AdminModel(),
  new AdminView(),
  new ViewManager(),
  new ModalManager()
);
adminController.init();
