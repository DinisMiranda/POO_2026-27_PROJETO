import { getLocale, t } from "./i18n.js";

export function getMoodLabels() {
 return {
  1: t("mood.1"),
  2: t("mood.2"),
  3: t("mood.3"),
  4: t("mood.4"),
  5: t("mood.5"),
 };
}

/** @deprecated use getMoodLabels() */
export const MOOD_LABELS = {
 1: "Muito baixo",
 2: "Baixo",
 3: "Moderado",
 4: "Bom",
 5: "Muito bem",
};

export function dateStr(date = new Date()) {
 return date.toISOString().slice(0, 10);
}

export function offsetDate(days) {
 const d = new Date();
 d.setDate(d.getDate() + days);
 return d;
}

export function formatDate(isoDate) {
 const [y, m, d] = isoDate.split("-");
 return `${d}/${m}/${y}`;
}

export function formatDateTime(isoDateTime) {
 const date = new Date(isoDateTime);
 if (Number.isNaN(date.getTime())) return formatDate(String(isoDateTime).slice(0, 10));
 return date.toLocaleString(getLocale(), {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
 });
}

export function escapeHtml(value) {
 return String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
}

export function getInitials(user) {
 const first = (user?.firstName || "").trim();
 const last = (user?.lastName || "").trim();
 if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
 if (user?.name) {
  const parts = user.name.trim().split(/\s+/);
  if (parts.length >= 2) {
   return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
 }
 return "ZU";
}
