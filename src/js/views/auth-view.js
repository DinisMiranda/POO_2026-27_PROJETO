export function showError(elementId, message) {
 const el = document.getElementById(elementId);
 if (!el) return;
 el.textContent = message;
 el.classList.remove("hidden");
}

export function hideError(elementId) {
 const el = document.getElementById(elementId);
 if (!el) return;
 el.textContent = "";
 el.classList.add("hidden");
}

export function bindLoginSubmit(handler) {
 const loginForm = document.getElementById("loginForm");
 if (!loginForm) return;
 loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  handler({
   email: String(fd.get("email") || "").trim(),
   password: String(fd.get("password") || ""),
  });
 });
}

export function bindRegisterSubmit(handler) {
 const registerForm = document.getElementById("registerForm");
 if (!registerForm) return;
 registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(registerForm);
  handler({
   name: String(fd.get("name") || "").trim(),
   email: String(fd.get("email") || "").trim(),
   password: String(fd.get("password") || ""),
  });
 });
}
