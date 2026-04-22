(() => {
  window.AuthView.bindRegisterSubmit(({ name, email, password }) => {
    window.AuthView.hideError("registerError");
    const result = window.AuthModel.registerUser({
      name,
      email,
      password,
      role: "user",
    });

    if (!result.ok) {
      window.AuthView.showError("registerError", result.message);
      return;
    }

    window.AuthModel.setSession({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    });
    window.location.href = "app.html";
  });
})();
