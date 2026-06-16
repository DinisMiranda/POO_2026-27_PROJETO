import { apiFetch } from "./http.js";
import { dateStr } from "./utils.js";

export async function fetchMoodLogs(userId) {
 const res = await apiFetch(`/moodLogs?userId=${userId}`);
 if (!res?.ok) return [];
 const logs = await res.json();
 return logs.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function saveMoodLog(userId, mood, note = "") {
 const today = dateStr();
 const logs = await fetchMoodLogs(userId);
 const existing = logs.find((entry) => entry.date === today);
 const payload = { mood, note: note || "" };

 if (existing?.id) {
  const res = await apiFetch(`/moodLogs/${existing.id}`, {
   method: "PATCH",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res?.ok) throw new Error("Erro ao atualizar humor.");
  return false;
 }

 const res = await apiFetch(`/moodLogs?userId=${userId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, date: today, ...payload }),
 });
 if (!res?.ok) throw new Error("Erro ao guardar humor.");
 return true;
}

export async function saveCheckinRecord(userId, level, note = "") {
 const res = await apiFetch("/checkins", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   userId,
   date: dateStr(),
   level,
   note: note || "",
  }),
 });
 if (!res?.ok) throw new Error("Erro ao guardar check-in.");
}
