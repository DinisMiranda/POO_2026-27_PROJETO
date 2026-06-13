const LANGUAGE_KEY = "zenify_language";
const DEFAULT_LANGUAGE = "pt";
const SUPPORTED_LANGUAGES = ["pt", "en"];

const DICTIONARY = {
 pt: {
  "nav.today": "Hoje",
  "nav.exercises": "Exercícios",
  "nav.insights": "Insights",
  "nav.journal": "Diário",
  "nav.profile": "Perfil",
  "nav.settings": "Configurações",
  "nav.help": "Ajuda",
  "topbar.today.title": "Olá",
  "topbar.today.subtitle":
   "Que bom te ver por aqui.<br />Como está a tua mente hoje?",
  "topbar.exercises.title": "Exercícios",
  "topbar.exercises.subtitle":
   "Escolhe práticas para respiração, foco e relaxamento.",
  "topbar.community.title": "Comunidade",
  "topbar.community.subtitle": "Liga-te a pessoas com objetivos semelhantes.",
  "topbar.insights.title": "Insights",
  "topbar.insights.subtitle": "Padrões de humor, consistência e progresso.",
  "topbar.profile.title": "Perfil",
  "topbar.profile.subtitle": "Gere a tua conta e acompanha o teu progresso.",
  "topbar.settings.title": "Configurações",
  "topbar.settings.subtitle": "Ajusta preferências e opções da tua conta.",
  "topbar.help.title": "Ajuda",
  "topbar.help.subtitle": "Encontra respostas rápidas e suporte.",
  "topbar.default.title": "Zenify",
  "topbar.default.subtitle": "A tua área pessoal.",
  "topbar.notifications": "Notificações",
  "topbar.profile": "Perfil",
  "settings.title": "Configurações",
  "settings.notifications": "Notificações",
  "settings.dailyReminder": "Lembrete de check-in diário",
  "settings.dailyReminderMeta": "Todos os dias às 20h",
  "settings.preventiveSuggestion": "Sugestão preventiva",
  "settings.preventiveSuggestionMeta": "Antes de períodos de exames",
  "settings.weeklySummary": "Resumo semanal",
  "settings.weeklySummaryMeta": "Insights e progresso",
  "settings.preferences": "Preferências",
  "settings.language": "Idioma",
  "settings.language.pt": "Português",
  "settings.language.en": "English",
  "settings.reminderTime": "Hora do lembrete",
  "settings.save": "Guardar preferências",
  "settings.privacy": "Privacidade",
  "settings.privacyText":
   "Os teus check-ins ficam associados ao teu utilizador. A comunidade é opcional e anónima por defeito.",
  "settings.visibleProfile": "Perfil visível na comunidade",
  "settings.saved": "Preferências guardadas.",
 },
 en: {
  "nav.today": "Today",
  "nav.exercises": "Exercises",
  "nav.insights": "Insights",
  "nav.journal": "Journal",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.help": "Help",
  "topbar.today.title": "Hello",
  "topbar.today.subtitle":
   "Good to see you here.<br />How is your mind today?",
  "topbar.exercises.title": "Exercises",
  "topbar.exercises.subtitle":
   "Choose practices for breathing, focus and relaxation.",
  "topbar.community.title": "Community",
  "topbar.community.subtitle": "Connect with people with similar goals.",
  "topbar.insights.title": "Insights",
  "topbar.insights.subtitle": "Mood patterns, consistency and progress.",
  "topbar.profile.title": "Profile",
  "topbar.profile.subtitle": "Manage your account and track your progress.",
  "topbar.settings.title": "Settings",
  "topbar.settings.subtitle": "Adjust your account preferences and options.",
  "topbar.help.title": "Help",
  "topbar.help.subtitle": "Find quick answers and support.",
  "topbar.default.title": "Zenify",
  "topbar.default.subtitle": "Your personal area.",
  "topbar.notifications": "Notifications",
  "topbar.profile": "Profile",
  "settings.title": "Settings",
  "settings.notifications": "Notifications",
  "settings.dailyReminder": "Daily check-in reminder",
  "settings.dailyReminderMeta": "Every day at 8 PM",
  "settings.preventiveSuggestion": "Preventive suggestion",
  "settings.preventiveSuggestionMeta": "Before exam periods",
  "settings.weeklySummary": "Weekly summary",
  "settings.weeklySummaryMeta": "Insights and progress",
  "settings.preferences": "Preferences",
  "settings.language": "Language",
  "settings.language.pt": "Portuguese",
  "settings.language.en": "English",
  "settings.reminderTime": "Reminder time",
  "settings.save": "Save preferences",
  "settings.privacy": "Privacy",
  "settings.privacyText":
   "Your check-ins are linked to your user account. Community is optional and anonymous by default.",
  "settings.visibleProfile": "Profile visible in the community",
  "settings.saved": "Preferences saved.",
 },
};

export function getLanguage() {
 const saved = localStorage.getItem(LANGUAGE_KEY);
 return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
}

export function applyDocumentLanguage() {
 const language = getLanguage();
 document.documentElement.lang = language === "pt" ? "pt-PT" : "en";
}

export function setLanguage(language) {
 const nextLanguage =
  SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

 localStorage.setItem(LANGUAGE_KEY, nextLanguage);
 applyDocumentLanguage();

 return nextLanguage;
}

export function t(key) {
 const language = getLanguage();
 return DICTIONARY[language]?.[key] || DICTIONARY[DEFAULT_LANGUAGE][key] || key;
}

export function applyTranslations(root = document) {
 applyDocumentLanguage();

 root.querySelectorAll("[data-i18n]").forEach((element) => {
  element.textContent = t(element.dataset.i18n);
 });

 root.querySelectorAll("[data-i18n-html]").forEach((element) => {
  element.innerHTML = t(element.dataset.i18nHtml);
 });

 root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
  element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
 });

 root.querySelectorAll("[data-i18n-title]").forEach((element) => {
  element.setAttribute("title", t(element.dataset.i18nTitle));
 });
}
