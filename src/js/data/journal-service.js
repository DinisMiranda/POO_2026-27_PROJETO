import { apiFetch, apiFetchJson } from "./http.js";
import { dateStr } from "./utils.js";

export async function fetchJournalEntries(userId) {
 const list = await apiFetchJson(`/journalEntries?userId=${userId}`).catch(
  () => [],
 );
 return list.sort((a, b) =>
  String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date)),
 );
}

export async function saveJournalEntry(userId, { title, body }) {
 const res = await apiFetch("/journalEntries", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
   userId,
   date: dateStr(),
   title: title.trim(),
   body: body.trim(),
   createdAt: new Date().toISOString(),
  }),
 });

 if (!res?.ok) throw new Error("Erro ao guardar entrada no diário.");
 return res.json();
}
