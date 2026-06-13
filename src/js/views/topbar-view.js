import { UserModel } from "../models/userModel.js";
import { applyDocumentLanguage, applyTranslations, t } from "../data/i18n.js";

applyDocumentLanguage();

function getInitials(user) {
 if (!user) return "ZU";

 const first = (user.firstName || "").trim();
 const last = (user.lastName || "").trim();

 if (first && last) {
  return `${first[0]}${last[0]}`.toUpperCase();
 }

 if (user.name) {
  const parts = user.name.trim().split(/\s+/);
  if (parts.length >= 2) {
   return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
 }

 return "ZU";
}

function getDisplayName(user) {
 if (!user) return "";

 const first = (user.firstName || "").trim();
 const last = (user.lastName || "").trim();
 const fullName = `${first} ${last}`.trim();

 return fullName || (user.name || "").trim();
}

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
   showBell: false,
  },
  comunidade: {
   title: t("topbar.community.title"),
   subtitle: t("topbar.community.subtitle"),
   showBell: false,
  },
  insights: {
   title: t("topbar.insights.title"),
   subtitle: t("topbar.insights.subtitle"),
   showBell: false,
  },
  perfil: {
   title: t("topbar.profile.title"),
   subtitle: t("topbar.profile.subtitle"),
   showBell: false,
  },
  configuracoes: {
   title: t("topbar.settings.title"),
   subtitle: t("topbar.settings.subtitle"),
   showBell: false,
  },
  ajuda: {
   title: t("topbar.help.title"),
   subtitle: t("topbar.help.subtitle"),
   showBell: false,
  },
 };

 return (
  map[page] || {
   title: t("topbar.default.title"),
   subtitle: t("topbar.default.subtitle"),
   showBell: false,
  }
 );
}

function renderBell() {
 return `
    <button class="notif-btn" aria-label="${t("topbar.notifications")}" type="button">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    </button>
  `;
}

export function mountTopbar() {
 const host = document.querySelector("[data-zenify-topbar]");
 if (!host) return;

 const page = document.body.dataset.zenifyPage || "";
 const user = UserModel.getSession();
 const initials = getInitials(user);
 const config = getTopbarConfig(page);
 const displayName = getDisplayName(user);

 if (page === "hoje" && displayName) {
  config.title = `${t("topbar.today.title")}, ${displayName}`;
 }

 host.classList.add("topbar");
 host.innerHTML = `
    <div class="topbar-greeting">
      <h1>${config.title}</h1>
      <p>${config.subtitle}</p>
    </div>

    <div class="topbar-actions">
      ${config.showBell ? renderBell() : ""}

      <a href="perfil.html" class="avatar-btn" aria-label="${t("topbar.profile")}">
        <div class="avatar">${initials}</div>
        <span>${initials}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </a>
    </div>
  `;

 applyTranslations();
}

mountTopbar();
