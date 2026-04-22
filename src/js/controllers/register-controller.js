class RegisterController {
  constructor(authModel, authView) {
    this.authModel = authModel;
    this.authView = authView;
  }

  init() {
    this.authView.bindRegisterSubmit(({ name, email, password }) => {
      this.authView.hideError("registerError");
      const result = this.authModel.registerUser({
        name,
        email,
        password,
        role: "user",
      });

      if (!result.ok) {
        this.authView.showError("registerError", result.message);
        return;
      }

      this.authModel.setSession({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      });
      window.location.href = "app.html";
    });
  }
}

const registerController = new RegisterController(new AuthModel(), new AuthView());
registerController.init();
