import { UserModel } from "../models/userModel.js";
import { StreakModel } from "../models/streakModel.js";
import { ProgressModel } from "../models/progressModel.js";

const user = UserModel.getSession();
if (!user) window.location.href = "landing.html";

// --- DOM ---
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

// --- Helpers ---
function getInitials(u) {
 const f = (u.firstName || "").trim();
 const l = (u.lastName || "").trim();
 if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
 if (u.name) {
  const parts = u.name.trim().split(/\s+/);
  return parts.length >= 2 ?
    `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
   : parts[0][0].toUpperCase();
 }
 return "ZU";
}

function showToast(msg, duration = 3000) {
 if (!toast) return;
 toast.textContent = msg;
 toast.classList.add("show");
 setTimeout(() => toast.classList.remove("show"), duration);
}

// --- Preencher campos estáticos ---
function fillUserInfo() {
 if (avatarEl) avatarEl.textContent = getInitials(user);
 if (nameEl) nameEl.textContent = user.name || `${user.firstName} ${user.lastName}`;
 if (emailEl) emailEl.textContent = user.email;
 if (inpFirst) inpFirst.value = user.firstName || "";
 if (inpLast) inpLast.value = user.lastName || "";
 if (inpEmail) inpEmail.value = user.email || "";
}

// --- Barra de XP ---
function renderXpBar(xp) {
 const xpPerLevel = 100;
 const level = ProgressModel.calcLevel(xp);
 const xpInLevel = xp % xpPerLevel;
 const pct = (xpInLevel / xpPerLevel) * 100;

 if (xpEl) xpEl.textContent = `${xp} XP`;
 if (levelEl) levelEl.textContent = `Nível ${level}`;
 if (xpBar) xpBar.style.width = `${pct}%`;
 if (xpLabel) xpLabel.textContent = `${xpInLevel} / ${xpPerLevel} XP`;
 if (levelLabel) levelLabel.textContent = `Nível ${level} → ${level + 1}`;
}

// --- Medalhas ---
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

// --- Desafios ---
function renderChallenges(challengeDefs, completedIds, stats, progress) {
 if (!challengesList) return;
 challengesList.innerHTML = "";

 for (const c of challengeDefs) {
  const done = completedIds.includes(c.id);

  let current = 0;
  if (c.type === "checkin") current = stats.totalCheckins || 0;
  if (c.type === "streak") current = stats.longestStreak || 0;
  if (c.type === "activities") current = (progress.activityTypes || []).length;

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

// --- Guardar perfil ---
formPerfil?.addEventListener("submit", async (e) => {
 e.preventDefault();
 const firstName = inpFirst?.value.trim() || "";
 const lastName = inpLast?.value.trim() || "";
 const email = inpEmail?.value.trim() || "";
 if (!firstName || !lastName || !email)
  return showToast("Preenche todos os campos.");

 try {
  const res = await fetch(`http://localhost:3000/users/${user.id}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
   }),
  });
  if (!res.ok) throw new Error();
  const updated = await res.json();
  UserModel.saveSession({ ...user, ...updated });
  showToast("Perfil atualizado com sucesso! ✓");
 } catch {
  showToast("Erro ao guardar. Tenta novamente.");
 }
});

// --- Logout ---
btnLogout?.addEventListener("click", () => {
 UserModel.clearSession();
 window.location.href = "landing.html";
});

// --- Carregar tudo ---
async function init() {
 fillUserInfo();

 try {
  const [stats, progress, challengeDefs, medalDefs] = await Promise.all([
   StreakModel.getStats(user.id),
   ProgressModel.getProgress(user.id),
   ProgressModel.getChallengeDefinitions(),
   ProgressModel.getMedalDefinitions(),
  ]);

  if (streakEl) streakEl.textContent = `Streak ${stats.streak || 0} dias`;
  if (checkinsEl) checkinsEl.textContent = `${stats.totalCheckins || 0} check-ins`;

  renderXpBar(progress.xp || 0);
  renderMedals(medalDefs, progress.unlockedMedals || []);
  renderChallenges(
   challengeDefs,
   progress.completedChallenges || [],
   stats,
   progress,
  );

  // Sincroniza desafios e medalhas com o estado atual
  await Promise.all([
   ProgressModel.syncChallenges(user.id, stats),
   ProgressModel.syncMedals(user.id, stats),
  ]);
 } catch (err) {
  console.error("Erro ao carregar perfil:", err);
 }
}

init();
