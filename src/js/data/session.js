import { UserService } from "./user-service.js";

/** Resolve sessão com dados frescos da API; redireciona se inválida. */
export async function requireSession(redirectTo = "landing.html") {
 const user = await UserService.resolveSession();
 if (!user?.id) {
  window.location.href = redirectTo;
  return null;
 }
 return user;
}
