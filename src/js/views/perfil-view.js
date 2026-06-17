import { Progress } from "../models/Progress.js";
import { getInitials } from "../data/utils.js";
import { getLocale, t, tf } from "../data/i18n.js";
import { localizeChallenge, localizeMedal } from "../data/content-i18n.js";

export const PerfilView = {
 avatarEl: document.getElementById("profile-avatar"),
 nameEl: document.getElementById("profile-name"),
 emailEl: document.getElementById("profile-email"),
 xpEl: document.getElementById("profile-xp"),
 levelEl: document.getElementById("profile-level"),
 streakEl: document.getElementById("profile-streak"),
 checkinsEl: document.getElementById("profile-checkins"),
 xpBar: document.getElementById("xp-bar"),
 xpLabel: document.getElementById("xp-label"),
 levelLabel: document.getElementById("level-label"),
 medalsGrid: document.getElementById("medals-grid"),
 challengesList: document.getElementById("challenges-list"),
 inpFirst: document.getElementById("inp-firstName"),
 inpLast: document.getElementById("inp-lastName"),
 inpEmail: document.getElementById("inp-email"),
 formPerfil: document.getElementById("form-perfil"),
 btnLogout: document.getElementById("btn-logout"),
 toast: document.getElementById("toast"),
 emailLockNotice: document.getElementById("email-lock-notice"),

 showToast(msg, duration = 3000) {
  if (!this.toast) return;
  this.toast.textContent = msg;
  this.toast.classList.add("show");
  setTimeout(() => this.toast.classList.remove("show"), duration);
 },

 fillUserInfo(user) {
  if (!user) return;

  if (this.avatarEl) this.avatarEl.textContent = getInitials(user);
  if (this.nameEl) {
   this.nameEl.textContent =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }
  if (this.emailEl) this.emailEl.textContent = user.email || "—";
  if (this.inpFirst) this.inpFirst.value = user.firstName || "";
  if (this.inpLast) this.inpLast.value = user.lastName || "";
  if (this.inpEmail) this.inpEmail.value = user.email || "";
 },

 applyEmailLockUI(user, lock) {
  if (!user || !this.inpEmail) return;

  if (!lock.allowed) {
   this.inpEmail.readOnly = true;
   this.inpEmail.classList.add("input-locked");
   if (this.emailLockNotice) {
    const dateStr = lock.unlockDate.toLocaleDateString(getLocale(), {
     day: "numeric",
     month: "long",
     year: "numeric",
    });
    this.emailLockNotice.textContent = tf("profile.emailLocked", { date: dateStr });
    this.emailLockNotice.hidden = false;
   }
  } else if (this.emailLockNotice) {
   this.emailLockNotice.hidden = true;
   this.inpEmail.readOnly = false;
   this.inpEmail.classList.remove("input-locked");
  }
 },

 renderXpBar(xp) {
  const xpPerLevel = 100;
  const level = Progress.calcLevel(xp);
  const tierName = Progress.getLevelTierName(level);
  const xpInLevel = Progress.getXpInLevel(xp);
  const pct = (xpInLevel / xpPerLevel) * 100;

  if (this.xpEl) this.xpEl.textContent = `${xp} XP`;
  if (this.levelEl) this.levelEl.textContent = tierName;
  if (this.xpBar) this.xpBar.style.width = `${pct}%`;
  if (this.xpLabel) this.xpLabel.textContent = `${xpInLevel} / ${xpPerLevel} XP`;
  if (this.levelLabel) {
   this.levelLabel.textContent = `${tierName} · ${t("common.level")} ${level} → ${level + 1}`;
  }
 },

 renderStats(progress) {
  if (this.streakEl) {
   this.streakEl.textContent = `Streak ${progress.streak || 0} ${t("common.days")}`;
  }
  if (this.checkinsEl) {
   this.checkinsEl.textContent = `${progress.totalCheckins || 0} ${t("profile.checkins")}`;
  }
 },

 renderMedals(medalDefs, unlockedIds) {
  if (!this.medalsGrid) return;
  this.medalsGrid.innerHTML = "";
  for (const m of medalDefs) {
   const unlocked = unlockedIds.includes(m.id);
   const item = localizeMedal(m);
   const div = document.createElement("div");
   div.className = "medal";
   div.innerHTML = `
      <div class="medal-icon ${unlocked ? "" : "locked"}"
           style="${unlocked ? `background:${m.color};color:${m.textColor}` : ""}">
        ${m.icon}
      </div>
      <div class="medal-name">${item.title}</div>
      <div class="medal-desc">${unlocked ? item.description : t("profile.locked")}</div>
    `;
   this.medalsGrid.appendChild(div);
  }
 },

 renderChallenges(challengeDefs, completedIds, progress) {
  if (!this.challengesList) return;
  this.challengesList.innerHTML = "";

  for (const c of challengeDefs) {
   const localized = localizeChallenge(c);
   const done = completedIds.includes(c.id);
   const current = Progress.getChallengeCurrent(c, progress);
   const pct = Math.min((current / c.target) * 100, 100);
   const row = document.createElement("div");
   row.className = `challenge-item${done ? " challenge-done" : ""}`;
   row.innerHTML = `
      <div class="challenge-icon">${c.icon}</div>
      <div class="challenge-info">
        <div class="challenge-title">${localized.title} ${done ? "✓" : ""}</div>
        <div class="challenge-desc">${localized.description} — <strong>${Math.min(current, c.target)} / ${c.target}</strong></div>
        <div class="challenge-bar-wrap">
          <div class="challenge-bar" style="width:${pct}%"></div>
        </div>
      </div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);white-space:nowrap;">+${c.xpReward} XP</div>
    `;
   this.challengesList.appendChild(row);
  }
 },

 getFormData() {
  return {
   firstName: this.inpFirst?.value.trim() || "",
   lastName: this.inpLast?.value.trim() || "",
   email: this.inpEmail?.value.trim() || "",
  };
 },
};
