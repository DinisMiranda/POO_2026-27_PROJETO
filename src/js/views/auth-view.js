const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

export function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message;
  element.classList.remove("hidden");
}

export function hideError(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = "";
  element.classList.add("hidden");
}

export function bindLoginSubmit(handler) {
  if (!loginForm) return;
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    handler({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    });
  });
}

export function bindRegisterSubmit(handler) {
  if (!registerForm) return;
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    handler({
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
    });
  });
}
