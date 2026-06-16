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
      title: t("topbar.journal.title"),
      subtitle: t("topbar.journal.subtitle"),
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

function getInitials(user) {
  if (!user) return "?";
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first[0].toUpperCase();
  return "A";
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

function renderAvatar(initials) {
  return `
    <div class="topbar-avatar-wrap">
      <button
        class="topbar-avatar"
        type="button"
        aria-label="${t("topbar.profileLabel")}"
        aria-haspopup="true"
        aria-expanded="false"
        data-avatar-trigger
      >${initials}</button>
      <div class="topbar-avatar-menu" role="menu" hidden>
        <a href="perfil.html" class="topbar-avatar-item" role="menuitem">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${t("topbar.profileLabel")}
        </a>
        <button class="topbar-avatar-item topbar-avatar-logout" role="menuitem" type="button" data-logout>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          ${t("topbar.logout")}
        </button>
      </div>
    </div>
  `;
}

function bindAvatar(host) {
  const trigger = host.querySelector("[data-avatar-trigger]");
  const menu = host.querySelector(".topbar-avatar-menu");
  const logoutBtn = host.querySelector("[data-logout]");

  if (!trigger || !menu) return;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", () => {
    if (!menu.hidden) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    await UserModel.logout?.();
    window.location.href = "../pages/landing.html";
  });
}

export async function mountTopbar() {
  const host = document.querySelector("[data-zenify-topbar]");
  if (!host) return;

  const page = document.body.dataset.zenifyPage || "";
  const user = await UserModel.resolveSession();
  const config = getTopbarConfig(page);
  const initials = getInitials(user);

  host.className = "topbar";
  host.innerHTML = `
    <div class="topbar-greeting">
      <h1>${user?.firstName ? `${config.title}, ${user.firstName}` : config.title}</h1>
      <p>${config.subtitle}</p>
    </div>

    <div class="topbar-actions">
      ${config.showBell ? renderBell() : ""}
      ${renderAvatar(initials)}
    </div>
  `;

  bindNotificationButtons(host);
  bindAvatar(host);
}
