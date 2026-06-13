const STORAGE_KEY = "zenify_locale";

export const LOCALES = {
 pt: "pt",
 en: "en",
};

const STRINGS = {
 pt: {
  "settings.title": "Configurações",
  "settings.subtitle": "Personaliza notificações e preferências da app.",
  "settings.notifications": "Notificações",
  "settings.reminder": "Lembrete de check-in diário",
  "settings.reminderHint": "Todos os dias às 20h",
  "settings.preventive": "Sugestão preventiva",
  "settings.preventiveHint": "Antes de períodos de exames",
  "settings.weekly": "Resumo semanal",
  "settings.weeklyHint": "Insights e progresso",
  "settings.preferences": "Preferências",
  "settings.language": "Idioma",
  "settings.reminderTime": "Hora do lembrete",
  "settings.save": "Guardar preferências",
  "settings.saved": "Preferências guardadas.",
  "settings.privacy": "Privacidade",
  "settings.privacyLead":
   "Os teus check-ins ficam associados ao teu utilizador. A comunidade é opcional e anónima por defeito.",
  "settings.communityVisible": "Perfil visível na comunidade",
  "lang.pt": "Português",
  "lang.en": "English",
 },
 en: {
  "settings.title": "Settings",
  "settings.subtitle": "Customize notifications and app preferences.",
  "settings.notifications": "Notifications",
  "settings.reminder": "Daily check-in reminder",
  "settings.reminderHint": "Every day at 8 PM",
  "settings.preventive": "Preventive suggestion",
  "settings.preventiveHint": "Before exam periods",
  "settings.weekly": "Weekly summary",
  "settings.weeklyHint": "Insights and progress",
  "settings.preferences": "Preferences",
  "settings.language": "Language",
  "settings.reminderTime": "Reminder time",
  "settings.save": "Save preferences",
  "settings.saved": "Preferences saved.",
  "settings.privacy": "Privacy",
  "settings.privacyLead":
   "Your check-ins are linked to your account. Community is optional and anonymous by default.",
  "settings.communityVisible": "Profile visible in community",
  "lang.pt": "Portuguese",
  "lang.en": "English",
 },
};

export function getStoredLocale() {
 return localStorage.getItem(STORAGE_KEY) || LOCALES.pt;
}

export function saveLocale(locale) {
 localStorage.setItem(STORAGE_KEY, locale);
 document.documentElement.lang = locale === LOCALES.en ? "en" : "pt";
}

export function t(key, locale = getStoredLocale()) {
 return STRINGS[locale]?.[key] ?? STRINGS.pt[key] ?? key;
}

export function applyTranslations(locale = getStoredLocale()) {
 document.querySelectorAll("[data-i18n]").forEach((el) => {
  const key = el.dataset.i18n;
  const value = t(key, locale);
  if (value) el.textContent = value;
 });

 document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
  const key = el.dataset.i18nPlaceholder;
  const value = t(key, locale);
  if (value) el.setAttribute("placeholder", value);
 });
}
