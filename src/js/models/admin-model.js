class AdminModel {
  constructor(apiClient = new ApiClient()) {
    this.apiClient = apiClient;
    this.STORAGE_KEY = "zenify_admin_activities";
    this.defaultActivities = [
      { id: 1, title: "Respiracao 4-4", type: "respiracao" },
      { id: 2, title: "Meditacao curta", type: "meditacao" },
    ];
  }

  async syncFromApiIfEmpty() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    const remote = await this.apiClient.get("activities");
    const activities = Array.isArray(remote) && remote.length ? remote : this.defaultActivities;
    this.setActivities(activities);
    return activities;
  }

  getActivities() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    this.setActivities(this.defaultActivities);
    return this.defaultActivities;
  }

  setActivities(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  addActivity({ title, type }) {
    const activities = this.getActivities();
    activities.push({
      id: Date.now(),
      title,
      type,
    });
    this.setActivities(activities);
    return activities;
  }

  removeActivity(id) {
    const activities = this.getActivities().filter((activity) => activity.id !== id);
    this.setActivities(activities);
    return activities;
  }
}
