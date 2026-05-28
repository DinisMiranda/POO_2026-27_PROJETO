export function redirectToLogin() {
  window.location.href = "login.html";
}

export function redirectByRole(role) {
  window.location.href = role === "admin" ? "admin.html" : "app.html";
}
