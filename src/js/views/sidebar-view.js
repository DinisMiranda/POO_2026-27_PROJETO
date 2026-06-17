import { t } from "../data/i18n.js";
import { UserService } from "../data/user-service.js";

const LOGO_SVG = `
<svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="4"/>
  <path d="M21 23h23L22 43h22" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 32c4.4-4 8.2-4 13 0s8.6 4 13 0" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M25 49c4.4 2.2 9.6 2.2 14 0" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
</svg>
`;

function getItems() {
 const session = UserService.getSession();
 const adminLink =
  session?.role === "admin" ?
   [{ key: "admin", href: "./admin.html", label: t("nav.admin") }]
  : [];

 return {
   main: [
   { key: "hoje", href: "./dashboard.html", label: t("nav.today") },
   { key: "exercicios", href: "./exercicios.html", label: t("nav.exercises") },
   { key: "insights", href: "./insights.html", label: t("nav.insights") },
   { key: "diario", href: "./diario.html", label: t("nav.journal") },
   { key: "perfil", href: "./perfil.html", label: t("nav.profile") },
   ...adminLink,
  ],
  bottom: [
   { key: "ajuda", href: "./ajuda.html", label: t("nav.help") },
   { key: "configuracoes", href: "./settings.html", label: t("nav.settings") },
  ],
 };
}

function renderNavLinks(items, activePage) {
 return items
  .map(
   (item) => `
          <a href="${item.href}"
             class="sidebar-link${item.key === activePage ? " active" : ""}"
             ${item.key === activePage ? 'aria-current="page"' : ""}>
            <span class="sidebar-icon" aria-hidden="true">${iconFor(item.key)}</span>
            <span>${item.label}</span>
          </a>`,
  )
  .join("");
}

function iconFor(key) {
 const icons = {
  hoje: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M12 3v18"/></svg>`,
  exercicios: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
  chatbot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  insights: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5"/><path d="M10 19V9"/><path d="M16 19V13"/><path d="M22 19V7"/></svg>`,
  diario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>`,
  perfil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`,
  admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
  configuracoes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.33H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .33 1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.3.47.64.6 1 .1.32.15.66.15 1s-.05.68-.15 1c-.13.36-.34.7-.6 1z"/></svg>`,
  ajuda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
 };
 return icons[key] || icons.hoje;
}

export function mountZenifySidebar(activePage = "") {
 const host = document.querySelector("[data-zenify-sidebar]");
 if (!host) return;

 const items = getItems();

 host.className = "sidebar";
 host.innerHTML = `
    <a href="./dashboard.html" class="sidebar-logo" style="text-decoration:none;color:inherit;">
      ${LOGO_SVG}
      <span>Zenify</span>
    </a>

    <nav class="sidebar-nav" aria-label="Principal">
      ${renderNavLinks(items.main, activePage)}
    </nav>

    <nav class="sidebar-nav sidebar-nav--bottom" aria-label="Secundário">
      ${renderNavLinks(items.bottom, activePage)}
    </nav>
  `;
}
