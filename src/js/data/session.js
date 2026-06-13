import { UserModel } from "../models/userModel.js";

/** Resolve sessão com dados frescos da API; redireciona se inválida. */
export async function requireSession(redirectTo = "landing.html") {
 const user = await UserModel.resolveSession();
 if (!user?.id) {
  window.location.href = redirectTo;
  return null;
 }
 return user;
}
