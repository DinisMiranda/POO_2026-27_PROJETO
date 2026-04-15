const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = "user";

  const result = registerUser({ name, email, password, role });
  if (!result.ok) {
    registerError.textContent = result.message;
    registerError.classList.remove("hidden");
    return;
  }

  setSession({ id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role });
  window.location.href = result.user.role === "admin" ? "admin.html" : "app.html";
});
