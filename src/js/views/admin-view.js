const activityForm = document.getElementById("activityForm");
const activityList = document.getElementById("activityList");
const userLabel = document.getElementById("userLabel");
const logoutBtn = document.getElementById("logoutBtn");
const activityCount = document.getElementById("activityCount");
const titleInput = document.getElementById("activityTitle");
const typeInput = document.getElementById("activityType");

export function renderUser(session) {
  if (userLabel) userLabel.textContent = `${session.name} (${session.role})`;
}

export function renderActivities(activities) {
  if (!activityList || !activityCount) return;

  activityList.innerHTML = "";
  activityCount.textContent = String(activities.length);

  activities.forEach((activity) => {
    const item = document.createElement("li");
    item.className = "flex items-center justify-between rounded-md bg-slate-50 p-3";
    item.innerHTML = `
      <span>${activity.title} <small class="text-slate-500">(${activity.type})</small></span>
      <button data-id="${activity.id}" class="rounded bg-rose-500 px-2 py-1 text-xs text-white">Remover</button>
    `;
    activityList.appendChild(item);
  });
}

export function resetForm() {
  if (activityForm) activityForm.reset();
}

export function bindCreate(handler) {
  if (!activityForm) return;
  activityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput?.value.trim() || "";
    const type = typeInput?.value || "";
    handler({ title, type });
  });
}

export function bindRemove(handler) {
  if (!activityList) return;
  activityList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const id = Number(target.dataset.id);
    if (!id) return;
    handler(id);
  });
}

export function bindLogout(handler) {
  if (logoutBtn) logoutBtn.addEventListener("click", handler);
}
