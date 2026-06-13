export function redirectToLogin() {
 window.location.href = "./landing.html";
}

export function redirectByRole(role) {
 window.location.href = role === "admin" ? "./admin.html" : "./dashboard.html";
}
