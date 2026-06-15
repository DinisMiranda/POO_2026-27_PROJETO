import { escapeHtml } from "../data/utils.js";

const ACTIVITY_TYPES = [
 "respiracao",
 "meditacao",
 "relaxamento",
 "diario",
 "movimento",
 "mindfulness",
];

const CHALLENGE_TYPES = ["checkin", "streak", "activities"];
const MOOD_LEVELS = ["baixo", "medio", "alto"];

function typeOptions(values, selected) {
 return values
  .map(
   (value) =>
    `<option value="${value}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`,
  )
  .join("");
}

export function showToast(message, isError = false) {
 const toast = document.getElementById("admin-toast");
 if (!toast) return;

 toast.textContent = message;
 toast.classList.toggle("admin-toast--error", isError);
 toast.classList.remove("hidden");

 clearTimeout(showToast._timer);
 showToast._timer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

export function renderOverview(totals) {
 const host = document.getElementById("admin-overview-stats");
 if (!host) return;

 const items = [
  { label: "Utilizadores", value: totals.users },
  { label: "Administradores", value: totals.admins },
  { label: "Exercícios", value: totals.activities },
  { label: "Check-ins", value: totals.checkins },
  { label: "Registos de humor", value: totals.moodLogs },
  { label: "Humor médio", value: `${totals.avgMood} / 5` },
  { label: "Streaks ativos", value: totals.activeStreaks },
  { label: "Desafios", value: totals.challenges },
  { label: "Medalhas", value: totals.medals },
  { label: "Dicas", value: totals.tips },
 ];

 host.innerHTML = items
  .map(
   (item) => `
    <article class="admin-stat">
     <span class="admin-stat-value">${escapeHtml(item.value)}</span>
     <span class="admin-stat-label">${escapeHtml(item.label)}</span>
    </article>`,
  )
  .join("");
}

export function renderUsers(users, currentUserId) {
 const host = document.getElementById("admin-users-list");
 if (!host) return;

 if (!users.length) {
  host.innerHTML = `<p class="admin-empty">Sem utilizadores.</p>`;
  return;
 }

 host.innerHTML = users
  .map((user) => {
   const name =
    user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
   const isSelf = user.id === currentUserId;

   return `
    <article class="list-row admin-user-row">
     <div class="admin-user-main">
      <strong>${escapeHtml(name)}</strong>
      <span class="admin-user-meta">${escapeHtml(user.email)}</span>
      <span class="admin-badge admin-badge--${user.role === "admin" ? "admin" : "user"}">${user.role === "admin" ? "Admin" : "Utilizador"}</span>
     </div>
     <div class="admin-user-side">
      <span class="admin-user-meta">${user.xp ?? 0} XP · streak ${user.streak ?? 0}</span>
      ${
       isSelf ?
        `<span class="admin-user-meta">Conta atual</span>`
       : `<div class="admin-row-actions">
          <select class="admin-inline-select" data-user-role="${escapeHtml(user.id)}" aria-label="Alterar perfil de ${escapeHtml(name)}">
           <option value="user"${user.role === "user" ? " selected" : ""}>Utilizador</option>
           <option value="admin"${user.role === "admin" ? " selected" : ""}>Admin</option>
          </select>
          <button type="button" class="btn-admin-danger" data-delete-user="${escapeHtml(user.id)}">Remover</button>
         </div>`
      }
     </div>
    </article>`;
  })
  .join("");
}

export function renderActivities(activities) {
 const host = document.getElementById("admin-activities-list");
 if (!host) return;

 if (!activities.length) {
  host.innerHTML = `<p class="admin-empty">Sem exercícios registados.</p>`;
  return;
 }

 host.innerHTML = activities
  .map(
   (item) => `
    <article class="list-row">
     <div>
      <strong>${escapeHtml(item.title)}</strong>
      <p class="admin-item-meta">${escapeHtml(item.type)} · ${item.duration || 5} min</p>
      ${item.description ? `<p class="admin-item-desc">${escapeHtml(item.description)}</p>` : ""}
     </div>
     <button type="button" class="btn-admin-danger" data-delete-activity="${escapeHtml(item.id)}">Remover</button>
    </article>`,
  )
  .join("");
}

export function renderChallenges(challenges) {
 const host = document.getElementById("admin-challenges-list");
 if (!host) return;

 if (!challenges.length) {
  host.innerHTML = `<p class="admin-empty">Sem desafios definidos.</p>`;
  return;
 }

 host.innerHTML = challenges
  .map(
   (item) => `
    <article class="list-row">
     <div>
      <strong>${escapeHtml(item.icon || "🎯")} ${escapeHtml(item.title)}</strong>
      <p class="admin-item-meta">${escapeHtml(item.type)} · meta ${item.target} · +${item.xpReward} XP</p>
      <p class="admin-item-desc">${escapeHtml(item.description)}</p>
     </div>
     <button type="button" class="btn-admin-danger" data-delete-challenge="${escapeHtml(item.id)}">Remover</button>
    </article>`,
  )
  .join("");
}

export function renderMedals(medals) {
 const host = document.getElementById("admin-medals-list");
 if (!host) return;

 if (!medals.length) {
  host.innerHTML = `<p class="admin-empty">Sem medalhas definidas.</p>`;
  return;
 }

 host.innerHTML = medals
  .map(
   (item) => `
    <article class="list-row">
     <div>
      <strong>${escapeHtml(item.icon || "🏅")} ${escapeHtml(item.title)}</strong>
      <p class="admin-item-meta">${escapeHtml(item.condition)}</p>
      <p class="admin-item-desc">${escapeHtml(item.description)}</p>
     </div>
     <button type="button" class="btn-admin-danger" data-delete-medal="${escapeHtml(item.id)}">Remover</button>
    </article>`,
  )
  .join("");
}

export function renderTips(tips) {
 const host = document.getElementById("admin-tips-list");
 if (!host) return;

 if (!tips.length) {
  host.innerHTML = `<p class="admin-empty">Sem dicas registadas.</p>`;
  return;
 }

 host.innerHTML = tips
  .map(
   (item) => `
    <article class="list-row">
     <div>
      <span class="admin-badge admin-badge--tip">${escapeHtml(item.mood)}</span>
      <p class="admin-item-desc">${escapeHtml(item.content)}</p>
     </div>
     <button type="button" class="btn-admin-danger" data-delete-tip="${escapeHtml(item.id)}">Remover</button>
    </article>`,
  )
  .join("");
}

export function bindActivityForm(onSubmit) {
 const form = document.getElementById("admin-activity-form");
 const typeSelect = document.getElementById("admin-activity-type");
 if (typeSelect) typeSelect.innerHTML = typeOptions(ACTIVITY_TYPES, "respiracao");

 form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("admin-activity-title")?.value.trim();
  const type = typeSelect?.value || "respiracao";
  const duration = Number(document.getElementById("admin-activity-duration")?.value || 5);
  const description = document.getElementById("admin-activity-description")?.value.trim();

  if (!title) return;

  await onSubmit({ title, type, duration, description });
  form.reset();
  if (typeSelect) typeSelect.value = "respiracao";
 });
}

export function bindChallengeForm(onSubmit) {
 const form = document.getElementById("admin-challenge-form");
 const typeSelect = document.getElementById("admin-challenge-type");
 if (typeSelect) typeSelect.innerHTML = typeOptions(CHALLENGE_TYPES, "checkin");

 form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("admin-challenge-title")?.value.trim();
  const description = document.getElementById("admin-challenge-description")?.value.trim();
  const type = typeSelect?.value || "checkin";
  const target = Number(document.getElementById("admin-challenge-target")?.value || 1);
  const xpReward = Number(document.getElementById("admin-challenge-xp")?.value || 50);
  const icon = document.getElementById("admin-challenge-icon")?.value.trim() || "🎯";

  if (!title || !description) return;

  await onSubmit({ title, description, type, target, xpReward, icon });
  form.reset();
  if (typeSelect) typeSelect.value = "checkin";
 });
}

export function bindMedalForm(onSubmit) {
 const form = document.getElementById("admin-medal-form");

 form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("admin-medal-title")?.value.trim();
  const description = document.getElementById("admin-medal-description")?.value.trim();
  const condition = document.getElementById("admin-medal-condition")?.value.trim();
  const icon = document.getElementById("admin-medal-icon")?.value.trim() || "🏅";
  const color = document.getElementById("admin-medal-color")?.value || "#ede8f8";
  const textColor = document.getElementById("admin-medal-text-color")?.value || "#6a5a9a";

  if (!title || !description || !condition) return;

  await onSubmit({ title, description, condition, icon, color, textColor });
  form.reset();
 });
}

export function bindTipForm(onSubmit) {
 const form = document.getElementById("admin-tip-form");
 const moodSelect = document.getElementById("admin-tip-mood");
 if (moodSelect) moodSelect.innerHTML = typeOptions(MOOD_LEVELS, "medio");

 form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const mood = moodSelect?.value || "medio";
  const content = document.getElementById("admin-tip-content")?.value.trim();

  if (!content) return;

  await onSubmit({ mood, content });
  form.reset();
  if (moodSelect) moodSelect.value = "medio";
 });
}

export function bindListActions(handlers) {
 document.body.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const userId = target.dataset.deleteUser;
  if (userId) {
   handlers.onDeleteUser?.(userId);
   return;
  }

  const activityId = target.dataset.deleteActivity;
  if (activityId) {
   handlers.onDeleteActivity?.(activityId);
   return;
  }

  const challengeId = target.dataset.deleteChallenge;
  if (challengeId) {
   handlers.onDeleteChallenge?.(challengeId);
   return;
  }

  const medalId = target.dataset.deleteMedal;
  if (medalId) {
   handlers.onDeleteMedal?.(medalId);
   return;
  }

  const tipId = target.dataset.deleteTip;
  if (tipId) {
   handlers.onDeleteTip?.(tipId);
  }
 });

 document.body.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;

  const userId = target.dataset.userRole;
  if (!userId) return;

  handlers.onUserRoleChange?.(userId, target.value);
 });
}
