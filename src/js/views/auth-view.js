class AuthView {
  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden");
  }

  hideError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = "";
    element.classList.add("hidden");
  }

  bindLoginSubmit(handler) {
    const form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      handler({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      });
    });
  }

  bindRegisterSubmit(handler) {
    const form = document.getElementById("registerForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      handler({
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || ""),
      });
    });
  }
}
