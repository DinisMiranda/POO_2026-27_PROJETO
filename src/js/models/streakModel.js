import { API as API_BASE } from "../data/config.js";

export const StreakModel = {
 /**
  * Devolve o userStats do utilizador da db.
  * Se ainda não existir, cria o registo base.
  */
 async getStats(userId) {
  const res = await fetch(`${API_BASE}/userStats?userId=${userId}`);
  if (!res.ok) throw new Error("Erro ao obter estatísticas.");
  const list = await res.json();
  if (list.length > 0) return list[0];
  return await this._createStats(userId);
 },

 async _createStats(userId) {
  const payload = {
   userId,
   streak: 0,
   lastCheckin: null,
   checkedInToday: false,
   longestStreak: 0,
   totalCheckins: 0,
   createdAt: new Date().toISOString(),
  };
  const res = await fetch(`${API_BASE}/userStats`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao inicializar estatísticas.");
  return await res.json();
 },

 /**
  * Faz o check-in diário.
  * - Último check-in hoje     → devolve alreadyDone: true
  * - Último check-in ontem    → streak +1
  * - Último check-in há 2+ dias → streak volta a 1
  */
 async doCheckin(userId) {
  const stats = await this.getStats(userId);
  const today = this._dateStr(new Date());
  const yesterday = this._dateStr(this._offsetDate(-1));

  if (stats.lastCheckin === today) {
   return { ...stats, alreadyDone: true };
  }

  const newStreak =
   stats.lastCheckin === yesterday ? (stats.streak || 0) + 1 : 1;

  const updated = {
   ...stats,
   streak: newStreak,
   longestStreak: Math.max(newStreak, stats.longestStreak || 0),
   totalCheckins: (stats.totalCheckins || 0) + 1,
   lastCheckin: today,
   checkedInToday: true,
  };

  const res = await fetch(`${API_BASE}/userStats/${stats.id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error("Erro ao guardar o check-in.");
  return { ...(await res.json()), alreadyDone: false };
 },

 /**
  * Chamado ao abrir a dashboard.
  * Se o utilizador saltou um dia, reset automático da streak para 0.
  */
 async syncStreak(userId) {
  const stats = await this.getStats(userId);
  const today = this._dateStr(new Date());
  const yesterday = this._dateStr(this._offsetDate(-1));

  if (stats.lastCheckin > today) {
   return { ...stats, checkedInToday: false, broken: false };
  }

  if (stats.lastCheckin === today) {
   return { ...stats, checkedInToday: true, broken: false };
  }
  if (stats.lastCheckin === yesterday || stats.lastCheckin === null) {
   return { ...stats, checkedInToday: false, broken: false };
  }

  // Saltou pelo menos 1 dia → reset
  if (stats.streak > 0) {
   const reset = { ...stats, streak: 0, checkedInToday: false };
   await fetch(`${API_BASE}/userStats/${stats.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reset),
   });
   return { ...reset, broken: true };
  }

  return { ...stats, checkedInToday: false, broken: false };
 },

 _dateStr(date) {
  return date.toISOString().slice(0, 10);
 },

 _offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
 },
};
