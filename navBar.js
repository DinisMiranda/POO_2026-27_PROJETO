const NAV_MAIN = [
 {
  key: "hoje",
  href: "zenify-dashboard.html",
  label: "Hoje",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
 },
 {
  key: "registo",
  href: "zenify-registo.html",
  label: "Registo",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
 },
 {
  key: "exercicios",
  href: "zenify-exercicios.html",
  label: "Exercicios",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/><path d="M2 20c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6"/></svg>',
 },
 {
  key: "insights",
  href: "zenify-insights.html",
  label: "Insights",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
 },
 {
  key: "comunidade",
  href: "zenify-comunidade.html",
  label: "Comunidade",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
 },
 {
  key: "perfil",
  href: "zenify-perfil.html",
  label: "Perfil",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
 },
];

const NAV_BOTTOM = [
 {
  key: "configuracoes",
  href: "zenify-configuracoes.html",
  label: "Configuracoes",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>',
 },
 {
  key: "ajuda",
  href: "zenify-ajuda.html",
  label: "Ajuda",
  icon:
   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
 },
];

const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
  <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="1.5"/>
  <path d="M14 8c0 0-4 3.5-4 7a4 4 0 0 0 8 0c0-3.5-4-7-4-7z" fill="currentColor" opacity="0.3"/>
  <path d="M14 8c0 0 4 3.5 4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M14 8c0 0-4 3.5-4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

function navLink(item, active) {
 const cls = item.key === active ? "nav-item active" : "nav-item";
 return `<a href="${item.href}" class="${cls}">${item.icon}${item.label}</a>`;
}

export function mountZenifySidebar(activeKey) {
 const host = document.querySelector("[data-zenify-sidebar]");
 if (!host) return;

 host.classList.add("sidebar");
 host.innerHTML = `
    <a href="zenify-dashboard.html" class="sidebar-logo" style="text-decoration:none;color:#fff;">${LOGO_SVG}Zenify</a>
    <nav class="sidebar-nav">${NAV_MAIN.map((item) => navLink(item, activeKey)).join("")}</nav>
    <div class="sidebar-bottom">${NAV_BOTTOM.map((item) => navLink(item, activeKey)).join("")}</div>
  `;
}

const active = document.body.dataset.zenifyPage;
if (active) mountZenifySidebar(active);
