(() => {
  const currentSession = window.AuthModel.getSession();
  if (currentSession) {
    window.location.href = currentSession.role === "admin" ? "admin.html" : "app.html";
    return;
  }

  window.AuthView.bindLoginSubmit(({ email, password }) => {
    window.AuthView.hideError("loginError");
    const result = window.AuthModel.loginUser({ email, password });
    if (!result.ok) {
      window.AuthView.showError("loginError", result.message);
      return;
    }

    window.location.href = result.session.role === "admin" ? "admin.html" : "app.html";
  });
})();
