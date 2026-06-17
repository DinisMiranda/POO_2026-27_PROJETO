import { mountExercisePlayer } from "./exercise-players.js";
import { t, tf } from "../data/i18n.js";
import { localizeActivity } from "../data/content-i18n.js";

const TYPE_ICONS = {
 respiracao: "calm",
 meditacao: "focus",
 relaxamento: "calm",
 diario: "ground",
 movimento: "focus",
};

function iconClass(type) {
 return TYPE_ICONS[type] || "calm";
}

function typeLabel(type) {
 return t(`exercises.types.${type}`) || type;
}

export const ExerciciosView = {
 gridEl: document.getElementById("exercises-grid"),
 modalEl: document.getElementById("exercise-modal"),
 modalTitle: document.getElementById("exercise-modal-title"),
 modalMeta: document.getElementById("exercise-modal-meta"),
 modalContent: document.getElementById("exercise-modal-content"),
 completeBtn: document.getElementById("exercise-complete"),
 toastEl: document.getElementById("exercise-toast"),
 xpModalEl: document.getElementById("exercise-xp-modal"),
 xpBadgeEl: document.getElementById("exercise-xp-badge"),
 xpSubtitleEl: document.getElementById("exercise-xp-subtitle"),
 xpExtraEl: document.getElementById("exercise-xp-extra"),

 activePlayer: null,

 showToast(msg, duration = 3500) {
  if (!this.toastEl) return;
  this.toastEl.textContent = msg;
  this.toastEl.classList.add("show");
  setTimeout(() => this.toastEl.classList.remove("show"), duration);
 },

 showXpModal({ xpGain, title, extraMessage = "" }) {
  if (!this.xpModalEl) return;

  if (this.xpBadgeEl) this.xpBadgeEl.textContent = `+${xpGain} ${t("common.xp")}`;
  if (this.xpSubtitleEl) {
   this.xpSubtitleEl.textContent = title ? tf("exercises.completedSubtitle", { title }) : "";
  }
  if (this.xpExtraEl) {
   if (extraMessage) {
    this.xpExtraEl.textContent = extraMessage;
    this.xpExtraEl.hidden = false;
   } else {
    this.xpExtraEl.hidden = true;
   }
  }

  this.xpModalEl.hidden = false;
 },

 closeXpModal() {
  if (this.xpModalEl) this.xpModalEl.hidden = true;
 },

 closeModal() {
  this.activePlayer?.destroy?.();
  this.activePlayer = null;
  if (this.modalContent) this.modalContent.innerHTML = "";
  if (this.modalEl) this.modalEl.hidden = true;
  if (this.completeBtn) {
   this.completeBtn.disabled = true;
   this.completeBtn.textContent = t("exercises.complete");
  }
 },

 openModal(activity) {
  if (!this.modalEl || !this.modalContent) return null;

  const localized = localizeActivity(activity);
  this.activePlayer?.destroy?.();

  if (this.modalTitle) this.modalTitle.textContent = localized.title;
  if (this.modalMeta) {
   this.modalMeta.textContent = `${activity.duration || 5} ${t("common.min")} · ${typeLabel(activity.type)}`;
  }
  if (this.completeBtn) this.completeBtn.disabled = true;

  this.modalEl.hidden = false;

  this.activePlayer = mountExercisePlayer(activity, this.modalContent, {
   onReadyToComplete: (canComplete) => {
    this.setCompleteEnabled(canComplete);
   },
  });

  return this.activePlayer;
 },

 setCompleteEnabled(enabled) {
  if (this.completeBtn) this.completeBtn.disabled = !enabled;
 },

 renderActivities(list) {
  if (!this.gridEl) return;

  if (!list.length) {
   this.gridEl.innerHTML = `<p class="card lead">${t("exercises.empty")}</p>`;
   return;
  }

  this.gridEl.innerHTML = list
   .map((activity) => {
    const item = localizeActivity(activity);
    return `
    <article class="exercise-card">
      <div class="exercise-card-top">
        <div class="exercise-icon ${iconClass(activity.type)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
          </svg>
        </div>
        <div class="exercise-info">
          <h4>${item.title}</h4>
          <p>${item.description || ""}</p>
          <div class="exercise-meta">
            <span>${activity.duration || 5} ${t("common.min")}</span>
            <span>${typeLabel(activity.type)}</span>
          </div>
        </div>
      </div>
      <button type="button" class="exercise-card-footer" data-start-activity="${activity.id}">
        <span>${t("common.start")}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </article>
  `;
   })
   .join("");
 },

 bindGridClick(handler) {
  this.gridEl?.addEventListener("click", (event) => {
   const btn = event.target.closest("[data-start-activity]");
   if (!btn) return;
   handler(btn.dataset.startActivity);
  });
 },

 bindComplete(handler) {
  this.completeBtn?.addEventListener("click", handler);
 },

 bindClose(handler) {
  this.modalEl?.querySelectorAll("[data-exercise-close]").forEach((el) => {
   el.addEventListener("click", handler);
  });
 },

 bindXpClose(handler) {
  this.xpModalEl?.querySelectorAll("[data-xp-close]").forEach((el) => {
   el.addEventListener("click", handler);
  });

  document.addEventListener("keydown", (event) => {
   if (event.key === "Escape" && this.xpModalEl && !this.xpModalEl.hidden) {
    handler();
   }
  });
 },
};
