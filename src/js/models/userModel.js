import { API } from "../data/config.js";
import { clearAuthToken, getAuthToken } from "../data/auth-token.js";
import { loginWithCredentials, registerAccount } from "../data/http.js";

const SESSION_KEY = "zenify_user";
const LEGACY_SESSION_KEY = "zenify_session";

function toSafeUser(user) {
 if (!user) return null;
 const { password: _pw, ...safeUser } = user;
 return safeUser;
}

export const UserModel = {
 async register({ firstName, lastName, email, password, dob }) {
  const user = await registerAccount({
   firstName: firstName.trim(),
   lastName: lastName.trim(),
   name: `${firstName} ${lastName}`.trim(),
   email: email.trim().toLowerCase(),
   password: password.trim(),
   dob,
   role: "user",
   xp: 0,
   streak: 0,
   badges: [],
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
  localStorage.setItem(
   LEGACY_SESSION_KEY,
   JSON.stringify({
    id: safeUser.id,
    name:
     safeUser.name ||
     `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim(),
    firstName: safeUser.firstName,
    lastName: safeUser.lastName,
    email: safeUser.email,
    role: safeUser.role,
   }),
  );
 },

 getSession() {
  try {
   const raw = sessionStorage.getItem(SESSION_KEY);
   if (raw) return JSON.parse(raw);

   const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
   return legacy ? JSON.parse(legacy) : null;
  } catch {
   return null;
  }
 },

 clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
  clearAuthToken();
 },

 async resolveSession() {
  const session = this.getSession();
  const token = getAuthToken();

  if (!session?.id || !token) return session;

  try {
   const res = await fetch(`${API}/users/${session.id}`, {
    headers: { Authorization: `Bearer ${token}` },
   });

   if (res.status === 401 || res.status === 403) {
    this.clearSession();
    return null;
   }

   if (!res.ok) return session;

   const safeUser = toSafeUser(await res.json());
   this.saveSession({ ...session, ...safeUser });
   return safeUser;
  } catch {
   return session;
  }
 },
};
