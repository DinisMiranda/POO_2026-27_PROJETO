import { UserModel } from "../models/userModel.js";
import { ProgressModel } from "../models/progressModel.js";
import { requireSession } from "../data/session.js";
import { apiFetch } from "../data/http.js";
import { mountAppShell } from "../views/app-shell.js";
import { getInitials } from "../data/utils.js";

const EMAIL_LOCK_DAYS = 30;

let activeUser = null;

const avatarEl = document.getElementById("profile-avatar");
const nameEl = document.getElementById("profile-name");
const emailEl = document.getElementById("profile-email");
const xpEl = document.getElementById("profile-xp");
const levelEl = document.getElementById("profile-level");
const streakEl = document.getElementById("profile-streak");
const checkinsEl = document.getElementById("profile-checkins");
const xpBar = document.getElementById("xp-bar");
const xpLabel = document.getElementById("xp-label");
const levelLabel = document.getElementById("level-label");
const medalsGrid = document.getElementById("medals-grid");
const challengesList = document.getElementById("challenges-list");
const inpFirst = document.getElementById("inp-firstName");
const inpLast = document.getElementById("inp-lastName");
const inpEmail = document.getElementById("inp-email");
const formPerfil = document.getElementById("form-perfil");
const btnLogout = document.getElementById("btn-logout");
const toast = document.getElementById("toast");
const emailLockNotice = document.getElementById("email-lock-notice");

function getEmailUnlockDate(createdAt) {
 const created = new Date(createdAt);
 const unlock = new Date(created);
 unlock.setDate(unlock.getDate() + EMAIL_LOCK_DAYS);
 return unlock;
}

function canChangeEmail(u) {
 if (!u?.createdAt) return { allowed: true };
 const unlock = getEmailUnlockDate(u.createdAt);
 return { allowed: new Date() >= unlock, unlockDate: unlock };
}

function applyEmailLockUI() {
 if (!activeUser) return;

 const lock = canChangeEmail(activeUser);
 if (!inpEmail) return;

 if (!lock.allowed) {
  inpEmail.readOnly = true;
  inpEmail.classList.add("input-locked");
  if (emailLockNotice) {
   const dateStr = lock.unlockDate.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
   });
   emailLockNotice.textContent = `Não podes alterar o email até ${dateStr} (30 dias após a criação da conta).`;
   emailLockNotice.hidden = false;
  }
 } else if (emailLockNotice) {
  emailLockNotice.hidden = true;
  inpEmail.readOnly = false;
  inpEmail.classList.remove("input-locked");
 }
}

function showToast(msg, duration = 3000) {
 if (!toast) return;
 toast.textContent = msg;
 toast.classList.add("show");
 setTimeout(() => toast.classList.remove("show"), duration);
}

function fillUserInfo() {
 if (!activeUser) return;

 if (avatarEl) avatarEl.textContent = getInitials(activeUser);
 if (nameEl) {
  nameEl.textContent =
   activeUser.name || `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim();
 }
 if (emailEl) emailEl.textContent = activeUser.email || "—";
 if (inpFirst) inpFirst.value = activeUser.firstName || "";
 if (inpLast) inpLast.value = activeUser.lastName || "";
 if (inpEmail) inpEmail.value = activeUser.email || "";
}

function renderXpBar(xp) {
 const xpPerLevel = 100;
 const level = ProgressModel.calcLevel(xp);
 const tierName = ProgressModel.getLevelTierName(level);
 const xpInLevel = ProgressModel.getXpInLevel(xp);
 const pct = (xpInLevel / xpPerLevel) * 100;

 if (xpEl) xpEl.textContent = `${xp} XP`;
 if (levelEl) levelEl.textContent = tierName;
 if (xpBar) xpBar.style.width = `${pct}%`;
 if (xpLabel) xpLabel.textContent = `${xpInLevel} / ${xpPerLevel} XP`;
 if (levelLabel) levelLabel.textContent = `${tierName} · Nível ${level} → ${level + 1}`;
}

function renderMedals(medalDefs, unlockedIds) {
 if (!medalsGrid) return;
 medalsGrid.innerHTML = "";
 for (const m of medalDefs) {
  const unlocked = unlockedIds.includes(m.id);
  const div = document.createElement("div");
  div.className = "medal";
  div.innerHTML = `
      <div class="medal-icon ${unlocked ? "" : "locked"}"
           style="${unlocked ? `background:${m.color};color:${m.textColor}` : ""}">
        ${m.icon}
      </div>
      <div class="medal-name">${m.title}</div>
      <div class="medal-desc">${unlocked ? m.description : "Bloqueada"}</div>
    `;
  medalsGrid.appendChild(div);
 }
}

function renderChallenges(challengeDefs, completedIds, progress) {
 if (!challengesList) return;
 challengesList.innerHTML = "";

 for (const c of challengeDefs) {
  const done = completedIds.includes(c.id);
  const current = ProgressModel.getChallengeCurrent(c, progress);

  const pct = Math.min((current / c.target) * 100, 100);
  const item = document.createElement("div");
  item.className = `challenge-item${done ? " challenge-done" : ""}`;
  item.innerHTML = `
      <div class="challenge-icon">${c.icon}</div>
      <div class="challenge-info">
        <div class="challenge-title">${c.title} ${done ? "✓" : ""}</div>
        <div class="challenge-desc">${c.description} — <strong>${Math.min(current, c.target)} / ${c.target}</strong></div>
        <div class="challenge-bar-wrap">
          <div class="challenge-bar" style="width:${pct}%"></div>
        </div>
      </div>
      <div style="font-size:var(--text-xs);color:var(--color-text-muted);white-space:nowrap;">+${c.xpReward} XP</div>
    `;
  challengesList.appendChild(item);
 }
}

formPerfil?.addEventListener("submit", async (e) => {
 e.preventDefault();
 if (!activeUser?.id) return;

 const firstName = inpFirst?.value.trim() || "";
 const lastName = inpLast?.value.trim() || "";
 const email = inpEmail?.value.trim() || "";
 if (!firstName || !lastName || !email)
  return showToast("Preenche todos os campos.");

 const emailChanged = email.toLowerCase() !== (activeUser.email || "").toLowerCase();
 if (emailChanged) {
  const lock = canChangeEmail(activeUser);
  if (!lock.allowed) {
   const dateStr = lock.unlockDate.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
   });
   return showToast(`Não podes alterar o email até ${dateStr}.`);
  }
 }

 try {
  const payload = { firstName, lastName, name: `${firstName} ${lastName}` };
  if (emailChanged) payload.email = email.toLowerCase();

  const res = await apiFetch(`/users/${activeUser.id}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error();
  const updated = await res.json();
  activeUser = { ...activeUser, ...updated };
  UserModel.saveSession(activeUser);
  fillUserInfo();
  showToast("Perfil atualizado com sucesso! ✓");
 } catch {
  showToast("Erro ao guardar. Tenta novamente.");
 }
});

btnLogout?.addEventListener("click", () => {
 UserModel.clearSession();
 window.location.href = "landing.html";
});

async function init() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 fillUserInfo();
 applyEmailLockUI();

 try {
  const [progress, challengeDefs, medalDefs] = await Promise.all([
   ProgressModel.getProgress(activeUser.id),
   ProgressModel.getChallengeDefinitions(),
   ProgressModel.getMedalDefinitions(),
  ]);

  if (streakEl) streakEl.textContent = `Streak ${progress.streak || 0} dias`;
  if (checkinsEl) {
   checkinsEl.textContent = `${progress.totalCheckins || 0} check-ins`;
  }

  renderXpBar(progress.xp || 0);
  renderMedals(medalDefs, progress.unlockedMedals || []);
  renderChallenges(
   challengeDefs,
   progress.completedChallenges || [],
   progress,
  );

  await Promise.all([
   ProgressModel.syncChallenges(activeUser.id),
   ProgressModel.syncMedals(activeUser.id),
  ]);
 } catch (err) {
  console.error("Erro ao carregar perfil:", err);
  showToast("Não foi possível carregar os dados. Verifica se o json-server está ativo.");
 }
}

init();
