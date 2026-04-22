window.AuthView = (() => {
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = "";
    element.classList.add("hidden");
  }

  function bindLoginSubmit(handler) {
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

  function bindRegisterSubmit(handler) {
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

  return {
    showError,
    hideError,
    bindLoginSubmit,
    bindRegisterSubmit,
  };
})();
