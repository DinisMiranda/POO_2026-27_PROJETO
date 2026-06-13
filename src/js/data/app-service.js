import { apiFetch } from "./http.js";
import { getSession } from "./auth-service.js";

function checkinsKey(userId) {
  return `zenify_checkins_${userId}`;
}

function statsKey(userId) {
  return `zenify_stats_${userId}`;
}

function readLocalCheckins(userId) {
  return JSON.parse(localStorage.getItem(checkinsKey(userId)) || "[]");
}

function writeLocalCheckins(userId, data) {
  localStorage.setItem(checkinsKey(userId), JSON.stringify(data));
}

const DEFAULT_STATS = {
  xp: 0,
  streak: 0,
  lastDate: "",
  streakStartDate: "",
  permanentTitle: "",
};

function readLocalStats(userId) {
  const saved = localStorage.getItem(statsKey(userId));
  if (!saved) return { ...DEFAULT_STATS };
  // Merge with defaults so older saves without new fields are upgraded automatically
  return { ...DEFAULT_STATS, ...JSON.parse(saved) };
}

function writeLocalStats(userId, data) {
  localStorage.setItem(statsKey(userId), JSON.stringify(data));
}

export async function getCheckins() {
  const session = getSession();
  if (!session) return [];

  const response = await apiFetch(`/checkins?userId=${session.id}`);
  if (response?.ok) {
    const remote = await response.json();
    writeLocalCheckins(session.id, remote);
    return remote;
  }

  return readLocalCheckins(session.id);
}

export async function addCheckin(entry) {
  const session = getSession();
  if (!session) return { ok: false };

  const payload = { ...entry, userId: session.id };
  const response = await apiFetch("/checkins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response?.ok) {
    const saved = await response.json();
    const checkins = readLocalCheckins(session.id);
    checkins.push(saved);
    writeLocalCheckins(session.id, checkins);
    return { ok: true, checkins };
  }

  const checkins = readLocalCheckins(session.id);
  checkins.push(payload);
  writeLocalCheckins(session.id, checkins);
  return { ok: true, checkins };
}

export async function getStats() {
  const session = getSession();
  if (!session) return { ...DEFAULT_STATS };

  const response = await apiFetch(`/userStats?userId=${session.id}`);
  if (response?.ok) {
    const rows = await response.json();
    const remote = rows[0] || {};
    // Always merge with defaults so missing fields are filled in
    const stats = { ...DEFAULT_STATS, ...remote };
    writeLocalStats(session.id, stats);
    return stats;
  }

  return readLocalStats(session.id);
}

export async function saveStats(stats) {
  const session = getSession();
  if (!session) return { ok: false };

  writeLocalStats(session.id, stats);

  const listResponse = await apiFetch(`/userStats?userId=${session.id}`);
  if (!listResponse?.ok) return { ok: true };

  const rows = await listResponse.json();
  const existing = rows[0];
  const payload = { ...stats, userId: session.id };

  if (existing?.id) {
    await apiFetch(`/userStats/${existing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await apiFetch("/userStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return { ok: true };
}
