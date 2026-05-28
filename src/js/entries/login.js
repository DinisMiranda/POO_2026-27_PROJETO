import { getSession, loginUser } from "../data/auth-service.js";
import { redirectByRole } from "../data/navigation.js";
import { bindLoginSubmit, hideError, showError } from "../views/auth-view.js";

const session = getSession();
if (session) {
  redirectByRole(session.role);
} else {
  bindLoginSubmit(({ email, password }) => {
    hideError("loginError");
    const result = loginUser({ email, password });
    if (!result.ok) {
      showError("loginError", result.message);
      return;
    }
    redirectByRole(result.session.role);
  });
}
