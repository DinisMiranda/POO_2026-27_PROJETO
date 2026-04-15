const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const currentSession = getSession();
if (currentSession) {
  window.location.href = currentSession.role === "admin" ? "admin.html" : "app.html";
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const result = loginUser({ email, password });
  if (!result.ok) {
    loginError.textContent = result.message;
    loginError.classList.remove("hidden");
    return;
  }

  window.location.href = result.session.role === "admin" ? "admin.html" : "app.html";
});
