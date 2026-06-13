import { requireAuth, clearSession } from "../data/auth-service.js";
import { initI18n, setPageTitle } from "../data/i18n.js";
import { mountAppShell } from "../views/app-shell.js";
import { redirectToLogin } from "../data/navigation.js";
import {
 addActivity,
 deleteActivity,
 getActivities,
} from "../data/activity-service.js";
import {
 bindCreate,
 bindLogout,
 bindRemove,
 renderActivities,
 renderUser,
 resetForm,
} from "../views/admin-view.js";
import { initViews } from "../views/view-manager.js";
import { createModal } from "../views/modal-manager.js";

function initAdminPage() {
 initI18n();
 mountAppShell();
 setPageTitle("page.title.admin");
}

async function startAdmin(session) {
 const modal = createModal({
  modalId: "feedbackModal",
  titleId: "modalTitle",
  bodyId: "modalBody",
  closeId: "modalCloseBtn",
 });

 initViews({
  selectorButtons: "[data-view-target]",
  selectorViews: "[data-view]",
  activeClass: "bg-indigo-600",
 });

 renderUser(session);

 async function refreshActivities() {
  const activities = await getActivities();
  renderActivities(activities);
 }

 await refreshActivities();

 bindLogout(() => {
  clearSession();
  redirectToLogin();
 });

 bindCreate(async ({ title, type }) => {
  if (!title) return;

  await addActivity({ title, type });
  resetForm();
  await refreshActivities();

  modal?.show({
   heading: "Atividade criada",
   message: "A nova atividade foi adicionada no servidor (visível para todos).",
  });
 });

 bindRemove(async (id) => {
  await deleteActivity(id);
  await refreshActivities();

  modal?.show({
   heading: "Atividade removida",
   message: "A atividade selecionada foi removida da lista.",
  });
 });
}

async function init() {
 const session = requireAuth("admin");
 if (!session) return;

 initAdminPage();
 await startAdmin(session);
}

init();
