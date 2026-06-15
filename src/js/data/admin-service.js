import { apiFetch } from "./http.js";

async function readList(path) {
 const res = await apiFetch(path);
 if (!res?.ok) return [];
 const data = await res.json();
 return Array.isArray(data) ? data : [];
}

async function mutate(path, method, body) {
 const res = await apiFetch(path, {
  method,
  headers: body ? { "Content-Type": "application/json" } : undefined,
  body: body ? JSON.stringify(body) : undefined,
 });
 return Boolean(res?.ok);
}

export const AdminService = {
 async getOverview() {
  const [users, activities, checkins, challenges, medals, tips, moodLogs, userStats] =
   await Promise.all([
    readList("/users"),
    readList("/activities"),
    readList("/checkins"),
    readList("/challengeDefinitions"),
    readList("/medalDefinitions"),
    readList("/tips"),
    readList("/moodLogs"),
    readList("/userStats"),
   ]);

  const regularUsers = users.filter((u) => u.role !== "admin");
  const avgMood =
   moodLogs.length ?
    moodLogs.reduce((sum, row) => sum + Number(row.mood || 0), 0) / moodLogs.length
   : 0;

  return {
   users,
   activities,
   challenges,
   medals,
   tips,
   totals: {
    users: regularUsers.length,
    admins: users.filter((u) => u.role === "admin").length,
    activities: activities.length,
    checkins: checkins.length,
    challenges: challenges.length,
    medals: medals.length,
    tips: tips.length,
    moodLogs: moodLogs.length,
    avgMood: avgMood.toFixed(1),
    activeStreaks: userStats.filter((s) => Number(s.streak) > 0).length,
   },
  };
 },

 getUsers: () => readList("/users"),
 updateUserRole: (id, role) => mutate(`/users/${id}`, "PATCH", { role }),
 deleteUser: (id) => mutate(`/users/${id}`, "DELETE"),

 getActivities: () => readList("/activities"),
 addActivity: (data) => mutate("/activities", "POST", data),
 deleteActivity: (id) => mutate(`/activities/${id}`, "DELETE"),

 getChallenges: () => readList("/challengeDefinitions"),
 addChallenge: (data) => mutate("/challengeDefinitions", "POST", data),
 deleteChallenge: (id) => mutate(`/challengeDefinitions/${id}`, "DELETE"),

 getMedals: () => readList("/medalDefinitions"),
 addMedal: (data) => mutate("/medalDefinitions", "POST", data),
 deleteMedal: (id) => mutate(`/medalDefinitions/${id}`, "DELETE"),

 getTips: () => readList("/tips"),
 addTip: (data) => mutate("/tips", "POST", data),
 deleteTip: (id) => mutate(`/tips/${id}`, "DELETE"),
};
