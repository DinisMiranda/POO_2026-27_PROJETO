const STORAGE_KEY = "zenify_admin_activities";

const activityForm = document.getElementById("activityForm");
const activityList = document.getElementById("activityList");
const userLabel = document.getElementById("userLabel");
const logoutBtn = document.getElementById("logoutBtn");

const session = requireAuth("admin");
if (!session) {
  throw new Error("Sessao invalida para area de administracao.");
}

userLabel.textContent = `${session.name} (${session.role})`;
logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = "login.html";
});

const defaultActivities = [
  { id: 1, title: "Respiracao 4-4", type: "respiracao" },
  { id: 2, title: "Meditacao curta", type: "meditacao" },
];

function getActivities() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultActivities));
  return defaultActivities;
}

function setActivities(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderActivities() {
  const activities = getActivities();
  activityList.innerHTML = "";

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

activityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.getElementById("activityTitle").value.trim();
  const type = document.getElementById("activityType").value;
  if (!title) return;

  const activities = getActivities();
  activities.push({
    id: Date.now(),
    title,
    type,
  });

  setActivities(activities);
  activityForm.reset();
  renderActivities();
});

activityList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const id = Number(target.dataset.id);
  if (!id) return;

  const activities = getActivities().filter((activity) => activity.id !== id);
  setActivities(activities);
  renderActivities();
});

renderActivities();
