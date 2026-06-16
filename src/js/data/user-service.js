import { clearAuthToken, getAuthToken } from "./auth-token.js";
import {
 apiFetch,
 loginWithCredentials,
 registerAccount,
} from "./http.js";

const SESSION_KEY = "zenify_user";

function toSafeUser(user) {
 if (!user) return null;
 const { password: _pw, ...safeUser } = user;
 return safeUser;
}

export const UserService = {
 async register({ firstName, lastName, email, password, dob }) {
  const user = await registerAccount({
   firstName: firstName.trim(),
   lastName: lastName.trim(),
   name: `${firstName} ${lastName}`.trim(),
   email: email.trim().toLowerCase(),
   password: password.trim(),
   dob,
   role: "user",
   createdAt: new Date().toISOString(),
  });

  return toSafeUser(user);
 },

 async login({ email, password }) {
  const user = await loginWithCredentials(email, password);
  return toSafeUser(user);
 },

 saveSession(user) {
  const safeUser = toSafeUser(user);
  if (!safeUser) return;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
 },

 getSession() {
  try {
   const raw = sessionStorage.getItem(SESSION_KEY);
   return raw ? JSON.parse(raw) : null;
  } catch {
   return null;
  }
 },

 clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("zenify_session");
  clearAuthToken();
 },

 async resolveSession() {
  const session = this.getSession();
  const token = getAuthToken();

  if (!session?.id || !token) return session;

  try {
   const res = await apiFetch(`/users/${session.id}`);
   if (res?.status === 401 || res?.status === 403) {
    this.clearSession();
    return null;
   }
   if (!res?.ok) return session;

   const safeUser = toSafeUser(await res.json());
   this.saveSession({ ...session, ...safeUser });
   return safeUser;
  } catch {
   return session;
  }
 },
};
