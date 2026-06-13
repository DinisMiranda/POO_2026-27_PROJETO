import { registerUser, setSession } from "../data/auth-service.js";
import {
 bindRegisterSubmit,
 hideError,
 showError,
} from "../views/auth-view.js";

bindRegisterSubmit(async ({ name, email, password }) => {
 hideError("registerError");
 try {
  const result = await registerUser({ name, email, password, role: "user" });
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
  window.location.href = "./dashboard.html";
 } catch {
  showError(
   "registerError",
   "Não foi possível ligar ao servidor. Verifica se o json-server está ativo (npm start).",
  );
 }
});
