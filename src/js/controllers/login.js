import { getSession, loginUser } from "../data/auth-service.js";
import { redirectByRole } from "../data/navigation.js";
import { bindLoginSubmit, hideError, showError } from "../views/auth-view.js";

const session = getSession();
if (session) {
 redirectByRole(session.role);
} else {
 bindLoginSubmit(async ({ email, password }) => {
  hideError("loginError");
  try {
   const result = await loginUser({ email, password });
   if (!result.ok) {
    showError("loginError", result.message);
    return;
   }
   redirectByRole(result.session.role);
  } catch {
   showError(
    "loginError",
    "Não foi possível ligar ao servidor. Verifica se o json-server está ativo (npm start).",
   );
  }
 });
}
