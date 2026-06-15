import { UserModel } from "../models/userModel.js";
import { requireSession } from "../data/session.js";
import { redirectByRole, redirectToLogin } from "../data/navigation.js";
import { initI18n, setPageTitle } from "../data/i18n.js";
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
 const users = await AdminService.getUsers();
 renderUsers(users, activeUser?.id);
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

 initI18n();
 mountAppShell();
 setPageTitle("page.title.admin");

 initViews({
  selectorButtons: "[data-view-target]",
  selectorViews: "[data-view]",
  activeClass: "admin-tab--active",
 });

 document.getElementById("btn-admin-logout")?.addEventListener("click", () => {
  UserModel.clearSession();
  redirectToLogin();
 });

 bindActivityForm(async (payload) => {
  const ok = await AdminService.addActivity(payload);
  if (!ok) {
   showToast("Não foi possível criar o exercício.", true);
   return;
  }
  showToast("Exercício adicionado.");
  await refreshActivities();
  await refreshOverview();
 });

 bindChallengeForm(async (payload) => {
  const ok = await AdminService.addChallenge(payload);
  if (!ok) {
   showToast("Não foi possível criar o desafio.", true);
   return;
  }
  showToast("Desafio adicionado.");
  await refreshChallenges();
  await refreshOverview();
 });

 bindMedalForm(async (payload) => {
  const ok = await AdminService.addMedal(payload);
  if (!ok) {
   showToast("Não foi possível criar a medalha.", true);
   return;
  }
  showToast("Medalha adicionada.");
  await refreshMedals();
  await refreshOverview();
 });

 bindTipForm(async (payload) => {
  const ok = await AdminService.addTip(payload);
  if (!ok) {
   showToast("Não foi possível criar a dica.", true);
   return;
  }
  showToast("Dica adicionada.");
  await refreshTips();
  await refreshOverview();
 });

 bindListActions({
  async onDeleteUser(id) {
   if (id === activeUser?.id) return;
   if (!confirm("Remover este utilizador?")) return;

   const ok = await AdminService.deleteUser(id);
   if (!ok) {
    showToast("Não foi possível remover o utilizador.", true);
    return;
   }
   showToast("Utilizador removido.");
   await refreshUsers();
   await refreshOverview();
  },

  async onUserRoleChange(id, role) {
   const ok = await AdminService.updateUserRole(id, role);
   if (!ok) {
    showToast("Não foi possível atualizar o perfil.", true);
    await refreshUsers();
    return;
   }
   showToast("Perfil atualizado.");
   await refreshUsers();
  },

  async onDeleteActivity(id) {
   if (!confirm("Remover este exercício?")) return;
   const ok = await AdminService.deleteActivity(id);
   if (!ok) {
    showToast("Não foi possível remover o exercício.", true);
    return;
   }
   showToast("Exercício removido.");
   await refreshActivities();
   await refreshOverview();
  },

  async onDeleteChallenge(id) {
   if (!confirm("Remover este desafio?")) return;
   const ok = await AdminService.deleteChallenge(id);
   if (!ok) {
    showToast("Não foi possível remover o desafio.", true);
    return;
   }
   showToast("Desafio removido.");
   await refreshChallenges();
   await refreshOverview();
  },

  async onDeleteMedal(id) {
   if (!confirm("Remover esta medalha?")) return;
   const ok = await AdminService.deleteMedal(id);
   if (!ok) {
    showToast("Não foi possível remover a medalha.", true);
    return;
   }
   showToast("Medalha removida.");
   await refreshMedals();
   await refreshOverview();
  },

  async onDeleteTip(id) {
   if (!confirm("Remover esta dica?")) return;
   const ok = await AdminService.deleteTip(id);
   if (!ok) {
    showToast("Não foi possível remover a dica.", true);
    return;
   }
   showToast("Dica removida.");
   await refreshTips();
   await refreshOverview();
  },
 });

 await refreshAll();
}

init();
