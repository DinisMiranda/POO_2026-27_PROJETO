class LoginController {
  constructor(authModel, authView) {
    this.authModel = authModel;
    this.authView = authView;
  }

  init() {
    const currentSession = this.authModel.getSession();
    if (currentSession) {
      window.location.href = currentSession.role === "admin" ? "admin.html" : "app.html";
      return;
    }

    this.authView.bindLoginSubmit(({ email, password }) => {
      this.authView.hideError("loginError");
      const result = this.authModel.loginUser({ email, password });
      if (!result.ok) {
        this.authView.showError("loginError", result.message);
        return;
      }

      window.location.href = result.session.role === "admin" ? "admin.html" : "app.html";
    });
  }
}

const loginController = new LoginController(new AuthModel(), new AuthView());
loginController.init();
