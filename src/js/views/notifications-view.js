import { NotificationsService } from "../data/notifications-service.js";
import { UserService } from "../data/user-service.js";

let modalEl = null;

function ensureModal() {
 if (modalEl) return modalEl;

 modalEl = document.createElement("div");
 modalEl.className = "notif-modal";
 modalEl.hidden = true;
 modalEl.innerHTML = `
  <div class="notif-modal-backdrop" data-notif-close></div>
  <div class="notif-modal-panel" role="dialog" aria-labelledby="notif-modal-title" aria-modal="true">
   <header class="notif-modal-header">
    <h2 id="notif-modal-title">Notificações</h2>
    <button type="button" class="notif-modal-close" data-notif-close aria-label="Fechar">&times;</button>
   </header>
   <div class="notif-modal-body" id="notif-modal-list"></div>
  </div>
 `;
 document.body.appendChild(modalEl);

 modalEl.querySelectorAll("[data-notif-close]").forEach((el) => {
  el.addEventListener("click", closeNotificationsModal);
 });

 document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalEl.hidden) closeNotificationsModal();
 });

 return modalEl;
}

function renderItem(item) {
 const typeLabel =
  item.type === "medal" ? "Medalha"
  : item.type === "challenge" ? "Desafio"
  : "Zenify AI";

 return `
  <article class="notif-item notif-item--${item.type}">
   <span class="notif-item-type">${typeLabel}</span>
   <h3>${item.title}</h3>
   <p>${item.message}</p>
  </article>
 `;
}

export async function openNotificationsModal() {
 const user = UserService.getSession();
 const modal = ensureModal();
 const list = modal.querySelector("#notif-modal-list");

 modal.hidden = false;
 document.body.classList.add("notif-modal-open");

 if (!user) {
  list.innerHTML = `
   <p class="notif-empty">Inicia sessão para ver medalhas, desafios e sugestões personalizadas.</p>
  `;
  return;
 }

 list.innerHTML = `<p class="notif-loading">A carregar…</p>`;

 try {
  const items = await NotificationsService.getForUser(user.id);
  list.innerHTML =
   items.length > 0 ?
    items.map(renderItem).join("")
   : `<p class="notif-empty">Sem notificações recentes.</p>`;
 } catch {
  list.innerHTML = `<p class="notif-empty">Não foi possível carregar notificações.</p>`;
 }
}

export function closeNotificationsModal() {
 if (!modalEl) return;
 modalEl.hidden = true;
 document.body.classList.remove("notif-modal-open");
}

export function bindNotificationButtons(root = document) {
 root.querySelectorAll("[data-notif-trigger]").forEach((btn) => {
  btn.addEventListener("click", (event) => {
   event.preventDefault();
   openNotificationsModal();
  });
 });
}
