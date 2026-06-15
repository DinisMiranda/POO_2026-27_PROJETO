import { UserModel } from "../models/userModel.js";
import { t } from "../data/i18n.js";
import { bindNotificationButtons } from "./notifications-view.js";

function getTopbarConfig(page) {
 const map = {
  hoje: {
   title: t("topbar.today.title"),
   subtitle: t("topbar.today.subtitle"),
   showBell: true,
  },
  exercicios: {
   title: t("topbar.exercises.title"),
   subtitle: t("topbar.exercises.subtitle"),
   showBell: true,
  },
  chatbot: {
   title: t("topbar.chatbot.title"),
   subtitle: t("topbar.chatbot.subtitle"),
   showBell: true,
  },
  diario: {
   title: t("topbar.community.title"),
   subtitle: t("topbar.community.subtitle"),
   showBell: true,
  },
  insights: {
   title: t("topbar.insights.title"),
   subtitle: t("topbar.insights.subtitle"),
   showBell: true,
  },
  perfil: {
   title: t("topbar.profile.title"),
   subtitle: t("topbar.profile.subtitle"),
   showBell: true,
  },
  configuracoes: {
   title: t("topbar.settings.title"),
   subtitle: t("topbar.settings.subtitle"),
   showBell: true,
  },
  ajuda: {
   title: t("topbar.help.title"),
   subtitle: t("topbar.help.subtitle"),
   showBell: false,
  },
  admin: {
   title: t("topbar.admin.title"),
   subtitle: t("topbar.admin.subtitle"),
   showBell: false,
  },
 };

 return (
  map[page] || {
   title: t("topbar.default.title"),
   subtitle: t("topbar.default.subtitle"),
   showBell: true,
  }
 );
}

function renderBell() {
 return `
    <button class="notif-btn" type="button" data-notif-trigger aria-label="${t("topbar.notifications")}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </button>
  `;
}

export async function mountTopbar() {
 const host = document.querySelector("[data-zenify-topbar]");
 if (!host) return;

 const page = document.body.dataset.zenifyPage || "";
 const user = await UserModel.resolveSession();
 const config = getTopbarConfig(page);

 host.className = "topbar";
 host.innerHTML = `
    <div class="topbar-greeting">
      <h1>${user?.firstName ? `${config.title}, ${user.firstName}` : config.title}</h1>
      <p>${config.subtitle}</p>
    </div>

    <div class="topbar-actions">
      ${config.showBell ? renderBell() : ""}
    </div>
  `;

 bindNotificationButtons(host);
}

mountTopbar();
