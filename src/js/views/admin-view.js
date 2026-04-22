window.AdminView = (() => {
  function getElements() {
    return {
      activityForm: document.getElementById("activityForm"),
      activityList: document.getElementById("activityList"),
      userLabel: document.getElementById("userLabel"),
      logoutBtn: document.getElementById("logoutBtn"),
      activityCount: document.getElementById("activityCount"),
      titleInput: document.getElementById("activityTitle"),
      typeInput: document.getElementById("activityType"),
    };
  }

  function renderUser(session) {
    const { userLabel } = getElements();
    userLabel.textContent = `${session.name} (${session.role})`;
  }

  function renderActivities(activities) {
    const { activityList, activityCount } = getElements();
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

  function resetForm() {
    const { activityForm } = getElements();
    activityForm.reset();
  }

  function bindCreate(handler) {
    const { activityForm, titleInput, typeInput } = getElements();
    activityForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = titleInput.value.trim();
      const type = typeInput.value;
      handler({ title, type });
    });
  }

  function bindRemove(handler) {
    const { activityList } = getElements();
    activityList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const id = Number(target.dataset.id);
      if (!id) return;
      handler(id);
    });
  }

  function bindLogout(handler) {
    const { logoutBtn } = getElements();
    logoutBtn.addEventListener("click", handler);
  }

  return {
    renderUser,
    renderActivities,
    resetForm,
    bindCreate,
    bindRemove,
    bindLogout,
  };
})();
