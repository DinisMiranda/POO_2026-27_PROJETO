(() => {
  const session = window.AuthModel.requireAuth("admin");
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

  function refreshActivities() {
    const activities = window.AdminModel.getActivities();
    window.AdminView.renderActivities(activities);
  }

  window.AdminView.renderUser(session);
  refreshActivities();

  window.AdminView.bindLogout(() => {
    window.AuthModel.clearSession();
    window.location.href = "login.html";
  });

  window.AdminView.bindCreate(({ title, type }) => {
    if (!title) return;
    window.AdminModel.addActivity({ title, type });
    window.AdminView.resetForm();
    refreshActivities();

    if (modal) {
      modal.show({
        heading: "Atividade criada",
        message: "A nova atividade foi adicionada com sucesso.",
      });
    }
  });

  window.AdminView.bindRemove((id) => {
    window.AdminModel.removeActivity(id);
    refreshActivities();

    if (modal) {
      modal.show({
        heading: "Atividade removida",
        message: "A atividade selecionada foi removida da lista.",
      });
    }
  });
})();
