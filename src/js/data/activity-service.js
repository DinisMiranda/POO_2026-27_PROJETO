import { apiFetch } from "./http.js";

export async function getActivities() {
  const response = await apiFetch("/activities");
  if (!response?.ok) return [];
  return response.json();
}

export async function addActivity({ title, type }) {
  const response = await apiFetch("/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, type }),
  });
  return { ok: Boolean(response?.ok) };
}

export async function deleteActivity(id) {
  const response = await apiFetch(`/activities/${id}`, { method: "DELETE" });
  return { ok: Boolean(response?.ok) };
}
