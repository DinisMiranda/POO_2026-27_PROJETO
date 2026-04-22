window.AdminModel = (() => {
  const STORAGE_KEY = "zenify_admin_activities";

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

  function addActivity({ title, type }) {
    const activities = getActivities();
    activities.push({
      id: Date.now(),
      title,
      type,
    });
    setActivities(activities);
    return activities;
  }

  function removeActivity(id) {
    const activities = getActivities().filter((activity) => activity.id !== id);
    setActivities(activities);
    return activities;
  }

  return {
    getActivities,
    addActivity,
    removeActivity,
  };
})();
