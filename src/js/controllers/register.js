import { registerUser, setSession } from "../data/auth-service.js";
import {
 bindRegisterSubmit,
 hideError,
 showError,
} from "../views/auth-view.js";

bindRegisterSubmit(({ name, email, password }) => {
 hideError("registerError");
 const result = registerUser({ name, email, password, role: "user" });

 if (!result.ok) {
  showError("registerError", result.message);
  return;
 }

 setSession({
  id: result.user.id,
  name: result.user.name,
  email: result.user.email,
  role: result.user.role,
 });
 window.location.href = "../src/pages/dashboard.html";
});
