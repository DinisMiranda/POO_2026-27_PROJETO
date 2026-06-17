import { UserService } from "../data/user-service.js";
import { requireSession } from "../data/session.js";
import { redirectByRole, redirectToLogin } from "../data/navigation.js";
import { setPageTitle, t } from "../data/i18n.js";
import { mountAppShell } from "../views/app-shell.js";
import { initViews } from "../views/view-manager.js";
import { AdminService } from "../data/admin-service.js";
import {
 bindActivityForm,
 bindChallengeForm,
 bindListActions,
 bindMedalForm,
 bindTipForm,
 renderActivities,
 renderChallenges,
 renderMedals,
 renderOverview,
 renderTips,
 renderUsers,
 showToast,
} from "../views/admin-view.js";

let activeUser = null;

async function refreshOverview() {
 const data = await AdminService.getOverview();
 renderOverview(data.totals);
 return data;
}

async function refreshUsers() {
 const [users, progressList] = await Promise.all([
  AdminService.getUsers(),
  AdminService.getUserProgress(),
 ]);
 const progressByUser = Object.fromEntries(
  progressList.map((row) => [row.userId, row]),
 );
 const enriched = users.map((user) => ({
  ...user,
  xp: progressByUser[user.id]?.xp ?? 0,
  streak: progressByUser[user.id]?.streak ?? 0,
 }));
 renderUsers(enriched, activeUser?.id);
}

async function refreshActivities() {
 renderActivities(await AdminService.getActivities());
}

async function refreshChallenges() {
 renderChallenges(await AdminService.getChallenges());
}

async function refreshMedals() {
 renderMedals(await AdminService.getMedals());
}

async function refreshTips() {
 renderTips(await AdminService.getTips());
}

async function refreshAll() {
 await Promise.all([
  refreshOverview(),
  refreshUsers(),
  refreshActivities(),
  refreshChallenges(),
  refreshMedals(),
  refreshTips(),
 ]);
}

async function init() {
 const user = await requireSession();
 if (!user) return;

 if (user.role !== "admin") {
  redirectByRole(user.role);
  return;
 }

 activeUser = user;

 mountAppShell();
 setPageTitle("page.title.admin");

 initViews({
  selectorButtons: "[data-view-target]",
  selectorViews: "[data-view]",
  activeClass: "admin-tab--active",
 });

 document.getElementById("btn-admin-logout")?.addEventListener("click", () => {
  UserService.clearSession();
  redirectToLogin();
 });

 bindActivityForm(async (payload) => {
  const ok = await AdminService.addActivity(payload);
  if (!ok) {
   showToast(t("admin.activityAddError"), true);
   return;
  }
  showToast(t("admin.activityAdded"));
  await refreshActivities();
  await refreshOverview();
 });

 bindChallengeForm(async (payload) => {
  const ok = await AdminService.addChallenge(payload);
  if (!ok) {
   showToast(t("admin.challengeAddError"), true);
   return;
  }
  showToast(t("admin.challengeAdded"));
  await refreshChallenges();
  await refreshOverview();
 });

 bindMedalForm(async (payload) => {
  const ok = await AdminService.addMedal(payload);
  if (!ok) {
   showToast(t("admin.medalAddError"), true);
   return;
  }
  showToast(t("admin.medalAdded"));
  await refreshMedals();
  await refreshOverview();
 });

 bindTipForm(async (payload) => {
  const ok = await AdminService.addTip(payload);
  if (!ok) {
   showToast(t("admin.tipAddError"), true);
   return;
  }
  showToast(t("admin.tipAdded"));
  await refreshTips();
  await refreshOverview();
 });

 bindListActions({
  async onDeleteUser(id) {
   if (id === activeUser?.id) return;
   if (!confirm(t("admin.confirmRemoveUser"))) return;

   const ok = await AdminService.deleteUser(id);
   if (!ok) {
    showToast(t("admin.userRemoveError"), true);
    return;
   }
   showToast(t("admin.userRemoved"));
   await refreshUsers();
   await refreshOverview();
  },

  async onUserRoleChange(id, role) {
   const ok = await AdminService.updateUserRole(id, role);
   if (!ok) {
    showToast(t("admin.roleUpdateError"), true);
    await refreshUsers();
    return;
   }
   showToast(t("admin.roleUpdated"));
   await refreshUsers();
  },

  async onDeleteActivity(id) {
   if (!confirm(t("admin.confirmRemoveActivity"))) return;
   const ok = await AdminService.deleteActivity(id);
   if (!ok) {
    showToast(t("admin.activityRemoveError"), true);
    return;
   }
   showToast(t("admin.activityRemoved"));
   await refreshActivities();
   await refreshOverview();
  },

  async onDeleteChallenge(id) {
   if (!confirm(t("admin.confirmRemoveChallenge"))) return;
   const ok = await AdminService.deleteChallenge(id);
   if (!ok) {
    showToast(t("admin.challengeRemoveError"), true);
    return;
   }
   showToast(t("admin.challengeRemoved"));
   await refreshChallenges();
   await refreshOverview();
  },

  async onDeleteMedal(id) {
   if (!confirm(t("admin.confirmRemoveMedal"))) return;
   const ok = await AdminService.deleteMedal(id);
   if (!ok) {
    showToast(t("admin.medalRemoveError"), true);
    return;
   }
   showToast(t("admin.medalRemoved"));
   await refreshMedals();
   await refreshOverview();
  },

  async onDeleteTip(id) {
   if (!confirm(t("admin.confirmRemoveTip"))) return;
   const ok = await AdminService.deleteTip(id);
   if (!ok) {
    showToast(t("admin.tipRemoveError"), true);
    return;
   }
   showToast(t("admin.tipRemoved"));
   await refreshTips();
   await refreshOverview();
  },
 });

 await refreshAll();
}

init();
