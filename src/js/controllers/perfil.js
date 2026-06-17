import { UserService } from "../data/user-service.js";
import { ProgressService } from "../data/progress-service.js";
import { requireSession } from "../data/session.js";
import { apiFetch } from "../data/http.js";
import { mountAppShell } from "../views/app-shell.js";
import { PerfilView as View } from "../views/perfil-view.js";
import { setPageTitle, getLocale, t, tf } from "../data/i18n.js";

const EMAIL_LOCK_DAYS = 30;

let activeUser = null;

function getEmailUnlockDate(createdAt) {
 const created = new Date(createdAt);
 const unlock = new Date(created);
 unlock.setDate(unlock.getDate() + EMAIL_LOCK_DAYS);
 return unlock;
}

function canChangeEmail(user) {
 if (!user?.createdAt) return { allowed: true };
 const unlock = getEmailUnlockDate(user.createdAt);
 return { allowed: new Date() >= unlock, unlockDate: unlock };
}

async function handleProfileSubmit(event) {
 event.preventDefault();
 if (!activeUser?.id) return;

 const { firstName, lastName, email } = View.getFormData();
 if (!firstName || !lastName || !email) {
  return View.showToast(t("profile.fillAll"));
 }

 const emailChanged = email.toLowerCase() !== (activeUser.email || "").toLowerCase();
 if (emailChanged) {
  const lock = canChangeEmail(activeUser);
  if (!lock.allowed) {
   const dateStr = lock.unlockDate.toLocaleDateString(getLocale(), {
    day: "numeric",
    month: "long",
    year: "numeric",
   });
   return View.showToast(tf("profile.emailLockedShort", { date: dateStr }));
  }
 }

 try {
  const payload = { firstName, lastName, name: `${firstName} ${lastName}` };
  if (emailChanged) payload.email = email.toLowerCase();

  const res = await apiFetch(`/users/${activeUser.id}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error();
  const updated = await res.json();
  activeUser = { ...activeUser, ...updated };
  UserService.saveSession(activeUser);
  View.fillUserInfo(activeUser);
  View.showToast(t("profile.saved"));
 } catch {
  View.showToast(t("profile.saveError"));
 }
}

function bindEvents() {
 View.formPerfil?.addEventListener("submit", handleProfileSubmit);

 View.btnLogout?.addEventListener("click", () => {
  UserService.clearSession();
  window.location.href = "landing.html";
 });
}

async function init() {
 mountAppShell();
 setPageTitle("page.title.profile");
 activeUser = await requireSession();
 if (!activeUser) return;

 bindEvents();
 View.fillUserInfo(activeUser);
 View.applyEmailLockUI(activeUser, canChangeEmail(activeUser));

 try {
  const [progress, challengeDefs, medalDefs] = await Promise.all([
   ProgressService.getProgress(activeUser.id),
   ProgressService.getChallengeDefinitions(),
   ProgressService.getMedalDefinitions(),
  ]);

  View.renderStats(progress);
  View.renderXpBar(progress.xp || 0);
  View.renderMedals(medalDefs, progress.unlockedMedals || []);
  View.renderChallenges(
   challengeDefs,
   progress.completedChallenges || [],
   progress,
  );

  await Promise.all([
   ProgressService.syncChallenges(activeUser.id),
   ProgressService.syncMedals(activeUser.id),
  ]);
 } catch (err) {
  console.error("Erro ao carregar perfil:", err);
  View.showToast(t("profile.loadError"));
 }
}

init();
