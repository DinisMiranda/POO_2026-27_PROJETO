import { APP_STRINGS } from "./i18n-app.js";

const LANGUAGE_KEY = "zenify_language";
const DEFAULT_LANGUAGE = "pt";
const SUPPORTED_LANGUAGES = ["pt", "en"];

function deepMerge(target, source) {
 for (const key of Object.keys(source)) {
  if (
   source[key] &&
   typeof source[key] === "object" &&
   !Array.isArray(source[key])
  ) {
   target[key] = deepMerge(target[key] || {}, source[key]);
  } else {
   target[key] = source[key];
  }
 }
 return target;
}

const DICTIONARY = {
 pt: {
  nav: {
   today: "Hoje",
   exercises: "Exercícios",
   chatbot: "Assistente",
   insights: "Insights",
   journal: "Diário",
   profile: "Perfil",
   settings: "Configurações",
   help: "Ajuda",
   admin: "Administração",
  },

  topbar: {
   today: {
    title: "Olá",
    subtitle: "Que bom te ver por aqui.<br />Como está a tua mente hoje?",
   },
   exercises: {
    title: "Exercícios",
    subtitle: "Escolhe práticas para respiração, foco e relaxamento.",
   },
   chatbot: {
    title: "Assistente",
    subtitle: "Conversa sobre bem-estar, stress e hábitos saudáveis.",
   },
   journal: {
    title: "Diário",
    subtitle: "Escreve como te sentes e conversa com o assistente Zenify.",
   },
   community: {
    title: "Comunidade",
    subtitle: "Liga-te a pessoas com objetivos semelhantes.",
   },
   insights: {
    title: "Insights",
    subtitle: "Padrões de humor, consistência e progresso.",
   },
   profile: {
    title: "Perfil",
    subtitle: "Gere a tua conta e acompanha o teu progresso.",
   },
   settings: {
    title: "Configurações",
    subtitle: "Ajusta preferências e opções da tua conta.",
   },
   help: {
    title: "Ajuda",
    subtitle: "Encontra respostas rápidas e suporte.",
   },
   admin: {
    title: "Administração",
    subtitle: "Gere utilizadores, conteúdos e métricas da plataforma.",
   },
   default: {
    title: "Zenify",
    subtitle: "A tua área pessoal.",
   },
   notifications: "Notificações",
   profileLabel: "Perfil",
   logout: "Terminar sessão",
  },

  settings: {
   title: "Configurações",
   notifications: "Notificações",
   dailyReminder: "Lembrete de check-in diário",
   dailyReminderMeta: "Todos os dias às 20h",
   preventiveSuggestion: "Sugestão preventiva",
   preventiveSuggestionMeta: "Antes de períodos de exames",
   weeklySummary: "Resumo semanal",
   weeklySummaryMeta: "Insights e progresso",
   preferences: "Preferências",
   language: "Idioma",
   languagePt: "Português",
   languageEn: "Inglês",
   reminderTime: "Hora do lembrete",
   save: "Guardar preferências",
   privacy: "Privacidade",
   privacyText:
    "Os teus check-ins ficam associados ao teu utilizador. A comunidade é opcional e anónima por defeito.",
   visibleProfile: "Perfil visível na comunidade",
   saved: "Preferências guardadas.",
  },

  general: {
   skipLink: "Saltar para o conteúdo",
   backToTop: "Voltar ao topo",
  },

  page: {
   title: {
    landing: "Zenify",
    dashboard: "Zenify – Hoje",
    exercises: "Zenify – Exercícios",
    chatbot: "Zenify – Assistente",
    insights: "Zenify – Insights",
    journal: "Zenify – Diário",
    profile: "Zenify – Perfil",
    settings: "Zenify – Configurações",
    help: "Zenify – Ajuda",
    admin: "Zenify | Admin",
   },
  },

  landing: {
   hero: {
    title: "A tua mente,<br />Em equilíbrio.",
    subtitle:
     "Zenify é a tua plataforma de bem-estar mental que combina tecnologia, ciência e atenção plena para te ajudar a viver melhor todos os dias.",
    cta: "Começar agora",
    proofHeadline: "Junta-te a mais de 50 mil pessoas",
    proofBody: "motivadas e em evolução.",
   },
   auth: {
    welcomeBack: "Bem-vindo(a) de volta",
    loginSubheading: "Entra na tua conta para acederes ao painel.",
    welcome: "Bem-vindo(a)",
    registerSubheading: "Regista-te ou inicia sessão na tua área Zenify.",
    loginTab: "Entrar",
    registerTab: "Criar conta",
    firstName: "Primeiro nome",
    lastName: "Último nome",
    email: "Email",
    dob: "Data de nascimento",
    password: "Palavra-passe",
    registerAction: "Criar conta",
    loginAction: "Entrar",
   },
   feature: {
    wellbeing: "O teu bem-estar, num só espaço",
    tracking: "Acompanha o teu estado mental",
    trackingDesc: "Regista o teu humor e descobre padrões no teu dia a dia.",
    exercises: "Exercícios personalizados",
    exercisesDesc:
     "Meditação, respiração e rotinas curtas adaptadas ao teu momento.",
    challenges: "Desafios & hábitos",
    challengesDesc:
     "Pequenos passos consistentes para evoluíres com motivação.",
    insights: "Insights inteligentes",
    insightsDesc:
     "Vê a tua progressão com dados simples e úteis para agir melhor.",
    community: "Comunidade segura",
   },
   questions: {
    q1: "A aplicação é gratuita?",
    a1: "Não. A utilização diária da aplicação não está limitada.",
    q2: "Os meus dados estão seguros?",
    a2: "Sim. Os teus dados são guardados localmente e apenas usados para melhorar a tua experiência.",
    q3: "Existe suporte técnico disponível 24/7?",
    a3: "Sim. Temos canais de apoio disponíveis para te ajudar quando precisares.",
   },
   error: {
    loginEmailRequired: "Indica o teu email.",
    loginEmailInvalid: "Email inválido.",
    loginPasswordRequired: "Indica a tua palavra-passe.",
    registerFirstNameRequired: "Indica o teu primeiro nome.",
    registerLastNameRequired: "Indica o teu último nome.",
    registerEmailRequired: "Indica o teu email.",
    registerEmailInvalid: "Email inválido.",
    registerDobRequired: "Indica a tua data de nascimento.",
    registerPasswordRequired: "Indica a tua palavra-passe.",
    registerPasswordLength: "A palavra-passe deve ter pelo menos 6 caracteres.",
    fixFields: "Corrige os campos assinalados.",
   },
  },
 },

 en: {
  nav: {
   today: "Today",
   exercises: "Exercises",
   chatbot: "Assistant",
   insights: "Insights",
   journal: "Journal",
   profile: "Profile",
   settings: "Settings",
   help: "Help",
   admin: "Administration",
  },

  topbar: {
   today: {
    title: "Hello",
    subtitle: "Good to see you here.<br />How is your mind today?",
   },
   exercises: {
    title: "Exercises",
    subtitle: "Choose practices for breathing, focus and relaxation.",
   },
   chatbot: {
    title: "Assistant",
    subtitle: "Talk about wellbeing, stress and healthy habits.",
   },
   journal: {
    title: "Journal",
    subtitle: "Write how you feel and chat with the Zenify assistant.",
   },
   community: {
    title: "Community",
    subtitle: "Connect with people with similar goals.",
   },
   insights: {
    title: "Insights",
    subtitle: "Mood patterns, consistency and progress.",
   },
   profile: {
    title: "Profile",
    subtitle: "Manage your account and track your progress.",
   },
   settings: {
    title: "Settings",
    subtitle: "Adjust your account preferences and options.",
   },
   help: {
    title: "Help",
    subtitle: "Find quick answers and support.",
   },
   admin: {
    title: "Administration",
    subtitle: "Manage users, content and platform metrics.",
   },
   default: {
    title: "Zenify",
    subtitle: "Your personal area.",
   },
   notifications: "Notifications",
   profileLabel: "Profile",
   logout: "Sign out",
  },

  settings: {
   title: "Settings",
   notifications: "Notifications",
   dailyReminder: "Daily check-in reminder",
   dailyReminderMeta: "Every day at 8 PM",
   preventiveSuggestion: "Preventive suggestion",
   preventiveSuggestionMeta: "Before exam periods",
   weeklySummary: "Weekly summary",
   weeklySummaryMeta: "Insights and progress",
   preferences: "Preferences",
   language: "Language",
   languagePt: "Portuguese",
   languageEn: "English",
   reminderTime: "Reminder time",
   save: "Save preferences",
   privacy: "Privacy",
   privacyText:
    "Your check-ins are linked to your user account. Community is optional and anonymous by default.",
   visibleProfile: "Profile visible in the community",
   saved: "Preferences saved.",
  },

  general: {
   skipLink: "Skip to content",
   backToTop: "Back to top",
  },

  page: {
   title: {
    landing: "Zenify",
    dashboard: "Zenify – Today",
    exercises: "Zenify – Exercises",
    chatbot: "Zenify – Assistant",
    insights: "Zenify – Insights",
    journal: "Zenify – Journal",
    profile: "Zenify – Profile",
    settings: "Zenify – Settings",
    help: "Zenify – Help",
    admin: "Zenify | Admin",
   },
  },

  landing: {
   hero: {
    title: "Your mind,<br />In balance.",
    subtitle:
     "Zenify is your mental wellness platform that combines technology, science and mindfulness to help you live better every day.",
    cta: "Get started",
    proofHeadline: "Join more than 50 thousand people",
    proofBody: "motivated and evolving.",
   },
   auth: {
    welcomeBack: "Welcome back",
    loginSubheading: "Sign in to access your dashboard.",
    welcome: "Welcome",
    registerSubheading: "Create your account or sign in to your Zenify area.",
    loginTab: "Login",
    registerTab: "Create account",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    dob: "Date of birth",
    password: "Password",
    registerAction: "Create account",
    loginAction: "Login",
   },
   feature: {
    wellbeing: "Your wellbeing in one place",
    tracking: "Track your mental state",
    trackingDesc: "Log your mood and discover patterns in your daily life.",
    exercises: "Personalized exercises",
    exercisesDesc:
     "Meditation, breathing and short routines adapted to your moment.",
    challenges: "Challenges & habits",
    challengesDesc: "Small consistent steps to help you grow with motivation.",
    insights: "Smart insights",
    insightsDesc:
     "See your progress with simple and useful data to act better.",
    community: "Safe community",
   },
   questions: {
    q1: "Is the app free?",
    a1: "No. Daily usage of the application is not limited.",
    q2: "Is my data safe?",
    a2: "Yes. Your data is stored locally and only used to improve your experience.",
    q3: "Is technical support available 24/7?",
    a3: "Yes. We provide ongoing support channels whenever needed.",
   },
   error: {
    loginEmailRequired: "Enter your email.",
    loginEmailInvalid: "Invalid email.",
    loginPasswordRequired: "Enter your password.",
    registerFirstNameRequired: "Enter your first name.",
    registerLastNameRequired: "Enter your last name.",
    registerEmailRequired: "Enter your email.",
    registerEmailInvalid: "Invalid email.",
    registerDobRequired: "Enter your date of birth.",
    registerPasswordRequired: "Enter your password.",
    registerPasswordLength: "Password must be at least 6 characters.",
    fixFields: "Fix the highlighted fields.",
   },
  },
 },
};

deepMerge(DICTIONARY.pt, APP_STRINGS.pt);
deepMerge(DICTIONARY.en, APP_STRINGS.en);

function resolvePath(object, path) {
 return path.split(".").reduce((acc, key) => acc?.[key], object);
}

export function getLanguage() {
 const saved = localStorage.getItem(LANGUAGE_KEY);
 return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
}

export function setLanguage(language) {
 const nextLanguage =
  SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

 localStorage.setItem(LANGUAGE_KEY, nextLanguage);
 applyDocumentLanguage();
 return nextLanguage;
}

export function applyDocumentLanguage() {
 const language = getLanguage();
 document.documentElement.lang = language === "pt" ? "pt-PT" : "en";
}

export function getLocale() {
 return getLanguage() === "en" ? "en-GB" : "pt-PT";
}

export function t(key) {
 const language = getLanguage();

 return (
  resolvePath(DICTIONARY[language], key) ??
  resolvePath(DICTIONARY[DEFAULT_LANGUAGE], key) ??
  key
 );
}

/** Traduz com substituição de placeholders: tf("key", { n: 3 }) → "3 dias" */
export function tf(key, vars = {}) {
 let text = t(key);
 for (const [name, value] of Object.entries(vars)) {
  text = text.replaceAll(`{${name}}`, String(value));
 }
 return text;
}

export function applyTranslations(root = document) {
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

 root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
  element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
 });
}

export function setPageTitle(key) {
 document.title = t(key);
}

export function initI18n(root = document) {
 applyDocumentLanguage();
 applyTranslations(root);
}
