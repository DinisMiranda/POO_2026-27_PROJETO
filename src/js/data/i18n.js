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
  "general.skipLink": "Saltar para o conteúdo",
  "general.backToTop": "Voltar ao topo",
  "page.title.landing": "Zenify",
  "page.title.dashboard": "Zenify – Hoje",
  "page.title.exercises": "Zenify – Exercícios",
  "page.title.insights": "Zenify – Insights",
  "page.title.journal": "Zenify – Diário",
  "page.title.profile": "Zenify – Perfil",
  "page.title.settings": "Zenify – Configurações",
  "page.title.help": "Zenify – Ajuda",
  "page.title.admin": "Zenify | Admin",
  "landing.hero.title": "A tua mente,<br />Em equilíbrio.",
  "landing.hero.subtitle":
   "Zenify é a tua plataforma de bem-estar mental que combina tecnologia, ciência e atenção plena para te ajudar a viver melhor todos os dias.",
  "landing.hero.cta": "Começar agora",
  "landing.hero.proofHeadline": "Junta-te a mais de 50 mil pessoas",
  "landing.hero.proofBody": "motivadas e em evolução.",
  "landing.auth.welcomeBack": "Bem-vindo(a) de volta",
  "landing.auth.loginSubheading": "Entra na tua conta para aceder à dashboard.",
  "landing.auth.welcome": "Bem-vindo(a)",
  "landing.auth.registerSubheading":
   "Regista-te ou inicia sessão na tua área Zenify.",
  "landing.auth.loginTab": "Entrar",
  "landing.auth.registerTab": "Criar conta",
  "landing.auth.firstName": "Primeiro nome",
  "landing.auth.lastName": "Último nome",
  "landing.auth.email": "Email",
  "landing.auth.dob": "Data de nascimento",
  "landing.auth.password": "Password",
  "landing.auth.registerAction": "Criar conta",
  "landing.auth.loginAction": "Entrar",
  "landing.feature.wellbeing": "O teu bem-estar, num só espaço",
  "landing.feature.tracking": "Acompanha o teu estado mental",
  "landing.feature.trackingDesc":
   "Regista o teu humor e descobre padrões no teu dia a dia.",
  "landing.feature.exercises": "Exercícios personalizados",
  "landing.feature.exercisesDesc":
   "Meditação, respiração e rotinas curtas adaptadas ao teu momento.",
  "landing.feature.challenges": "Desafios & hábitos",
  "landing.feature.challengesDesc":
   "Pequenos passos consistentes para evoluíres com motivação.",
  "landing.feature.insights": "Insights inteligentes",
  "landing.feature.insightsDesc":
   "Vê a tua progressão com dados simples e úteis para agir melhor.",
  "landing.feature.community": "Comunidade segura",
  "landing.questions.q1": "A aplicação é gratuita?",
  "landing.questions.a1":
   "Não. A utilização diária da aplicação não está limitada.",
  "landing.questions.q2": "Os meus dados estão seguros?",
  "landing.questions.a2":
   "Sim. Os teus dados são guardados localmente e apenas usados para melhorar a tua experiência.",
  "landing.questions.q3": "Existe suporte técnico disponível 24/7?",
  "landing.questions.a3":
   "Sim. Contacta-nos através do email de suporte se precisares de ajuda.",
  "landing.footer.ready": "Pronto para começar?",
  "landing.footer.subtitle": "Da ansiedade académica ao equilíbrio diário.",
  "landing.footer.platform": "Plataforma",
  "landing.footer.dashboard": "Dashboard",
  "landing.footer.journal": "Diário",
  "landing.footer.exercises": "Exercícios de calma",
  "landing.footer.insights": "Insights",
  "landing.footer.profile": "Perfil",
  "landing.footer.resources": "Recursos",
  "landing.footer.faq": "Perguntas frequentes",
  "landing.footer.helpCenter": "Centro de ajuda",
  "landing.footer.settings": "Configurações",
  "landing.footer.legal": "Legal",
  "landing.footer.privacy": "Privacidade",
  "landing.footer.terms": "Termos de utilização",
  "landing.footer.cookies": "Cookies",
  "landing.footer.copyright": "© 2026 Zenify. Projeto académico POO 2026/27.",
  "landing.footer.support": "Suporte",
  "landing.footer.classicApp": "App clássica",
  "dashboard.mentalState.title": "O teu estado mental atual",
  "dashboard.mentalState.value": "Equilibrada",
  "dashboard.mentalState.description":
   "Tens mantido bons hábitos esta semana.<br />Continua assim!",
  "dashboard.mentalState.trendStable": "Tendência estável",
  "dashboard.mood.title": "O teu humor esta semana",
  "dashboard.mood.description": "O teu humor médio foi bom esta semana.",
  "dashboard.progress.title": "Progresso",
  "dashboard.progress.streakSingular": "dia seguido",
  "dashboard.progress.streakPlural": "dias seguidos",
  "dashboard.progress.checkinDone": "✓ Check-in feito hoje",
  "dashboard.progress.checkinAction": "Fazer check-in de hoje",
  "dashboard.badges.title": "Medalhas conquistadas",
  "dashboard.badges.calmWeek": "Calm Week",
  "dashboard.badges.calmWeekMeta": "1 semana",
  "dashboard.badges.zenMonth": "Zen Month x3",
  "dashboard.badges.zenMonthMeta": "3 meses",
  "dashboard.badges.focusDaily": "Foco Diário",
  "dashboard.badges.focusDailyMeta": "10 dias",
  "dashboard.recommended.title": "Recomendado para ti",
  "dashboard.exercise.breathing": "Respiração consciente",
  "dashboard.exercise.breathingDesc": "Reduz o stress e acalma a mente",
  "dashboard.exercise.duration.5min": "5 min",
  "dashboard.exercise.category.stress": "Stress",
  "dashboard.exercise.sleep": "Sono profundo",
  "dashboard.exercise.sleepDesc": "Relaxamento para uma noite tranquila",
  "dashboard.exercise.challenge.active": "Desafio ativo",
  "dashboard.exercise.challenge.title": "Desafio Zen: 7 dias de atenção plena",
  "dashboard.exercise.challenge.desc":
   "Pratica atenção plena todos os dias durante 7 dias.",
  "dashboard.exercise.challenge.progress": "5/7 dias",
  "dashboard.exercise.challenge.view": "Ver desafio",
  "dashboard.exercise.upcoming": "Próximos exercícios",
  "dashboard.exercise.focus": "Atenção plena",
  "dashboard.exercise.focusDesc":
   "Foca-te no presente e melhora a concentração",
  "dashboard.exercise.focusDuration": "7 min",
  "dashboard.exercise.focusCategory": "Foco",
  "exercises.card.breathing44": "Respiração 4-4",
  "exercises.card.breathing44Desc": "Inspirar e expirar durante 4 segundos.",
  "exercises.card.time.2min": "2 min",
  "exercises.card.category.breathing": "Respiração",
  "exercises.card.boxBreathing": "Box breathing",
  "exercises.card.boxBreathingDesc":
   "Técnica 4-4-4-4 para foco antes de exames.",
  "exercises.card.time.3min": "3 min",
  "exercises.card.grounding": "Grounding 5-4-3-2-1",
  "exercises.card.groundingDesc": "Volta ao presente através dos sentidos.",
  "exercises.card.sleepDeep": "Sono profundo",
  "exercises.card.sleepDeepDesc": "Relaxamento ideal para uma noite de estudo.",
  "exercises.card.mindfulness": "Atenção plena",
  "exercises.card.mindfulnessDesc": "Foco no presente entre aulas ou tarefas.",
  "exercises.card.mindfulnessCategory": "Foco",
  "exercises.card.miniPmr": "Mini-PMR",
  "exercises.card.miniPmrDesc": "Liberta tensão nos ombros, mãos e maxilar.",
  "exercises.card.relaxationCategory": "Relaxamento",
  "exercises.card.start": "Iniciar",
  "insights.card.totalXp": "XP total",
  "insights.card.noWeeklyData": "Sem dados semanais",
  "insights.card.currentStreak": "Streak atual",
  "insights.card.bestStreak": "Melhor sequência: {days} dias",
  "insights.card.avgMood": "Humor médio",
  "insights.card.last30Days": "Últimos 30 dias",
  "insights.card.weeklySummary": "Resumo semanal",
  "insights.card.checkins": "Check-ins",
  "insights.card.sessions": "{sessions} sessões completas",
  "insights.card.xp": "+{xp} XP",
  "insights.card.criticalPeriod": "Período crítico",
  "insights.card.pattern": "Padrão",
  "insights.card.personalized": "Recomendações personalizadas",
  "insights.card.basedOnHistory": "Com base no teu histórico e dados recentes.",
  "insights.recommendation.open": "Abrir",
  "insights.recommendation.emotionRegulation": "Reforçar regulação emocional",
  "insights.recommendation.emotionRegulationDesc":
   "Experimenta respiração box e diário de gratidão nos dias de humor mais baixo.",
  "insights.recommendation.postStudy": "Rotina pós-estudo",
  "insights.recommendation.postStudyDesc":
   "Cria um fecho de dia com meditação curta e menos tempo de ecrã.",
  "insights.recommendation.keepConsistency": "Mantém a consistência",
  "insights.recommendation.keepConsistencyDesc":
   "Estás num bom ritmo. Continua com micro check-ins diários.",
  "insights.recommendation.addMovement": "Sobe a dificuldade",
  "insights.recommendation.addMovementDesc":
   "Adiciona uma sessão de movimento consciente para diversificar hábitos.",
  "insights.recommendation.createDailyHabits": "Criar hábito diário",
  "insights.recommendation.createDailyHabitsDesc":
   "Faz pelo menos um check-in por dia para ganhar consistência.",
  "insights.recommendation.exploreExercises": "Explorar exercícios",
  "insights.recommendation.exploreExercisesDesc":
   "Testa respiração, meditação e diário para perceber o que funciona melhor contigo.",
  "insights.recommendation.criticalPeriodWednesday": "Quartas à tarde",
  "insights.recommendation.criticalPeriodMonday": "Segundas ao fim do dia",
  "insights.recs.errorLoading": "Erro ao carregar insights",
  "journal.newPost": "Nova publicação",
  "journal.whatsOnYourMind": "O que queres partilhar?",
  "journal.postPlaceholder": "Ex.: Completei 7 dias de check-in...",
  "journal.publish": "Publicar",
  "journal.postRita": "Rita — Engenharia",
  "journal.postJoao": "João — Direito",
  "journal.postAna": "Ana — Psicologia",
  "journal.postChallenge": "Desafio Zen",
  "journal.postHoursAgo": "Há 2 horas",
  "journal.postReactions.12": "12 reações",
  "journal.postYesterday": "Ontem",
  "journal.postReactions.8": "8 reações",
  "journal.postReactions.5": "5 comentários",
  "journal.postActiveChallenge": "Desafio ativo",
  "help.heading": "Começar",
  "help.question.checkin": "Como faço o check-in diário?",
  "help.answer.checkin":
   "Vai a Registo, escolhe o nível de humor (1-5), escreve uma nota opcional e carrega em Guardar check-in.",
  "help.question.streak": "O que é o streak?",
  "help.answer.streak":
   "É o número de dias seguidos com check-in. Mantém a consistência para desbloquear medalhas e ganhar XP extra.",
  "help.question.exercises": "Como funcionam os exercícios?",
  "help.answer.exercises":
   "Em Exercícios escolhes uma intervenção curta (respiração, grounding, relaxamento). Ao concluir, ganhas pontos de consistência.",
  "help.assistant.title": "Assistente",
  "help.assistant.description":
   "O assistente responde a perguntas sobre ansiedade académica, stress e hábitos de estudo. Com Ollama activo, as respostas são geradas localmente.",
  "help.openClassicApp": "Abrir app clássica",
  "help.support.title": "Suporte",
  "help.support.description":
   "O Zenify não substitui apoio psicológico profissional. Em caso de crise, contacta os serviços de saúde mental da tua instituição.",
  "help.support.email": "Email: suporte@zenify.local",
  "profile.personalData": "Dados pessoais",
  "profile.firstName": "Primeiro nome",
  "profile.lastName": "Apelido",
  "profile.email": "Email",
  "profile.saveChanges": "Guardar alterações",
  "profile.logout": "Terminar sessão",
  "profile.badges": "Medalhas",
  "profile.badgesDescription":
   "Medalhas desbloqueadas com base no teu progresso.",
  "profile.challenges": "Desafios",
  "profile.challengesDescription":
   "Progresso atualizado automaticamente com os teus check-ins e atividades.",
  "admin.skipLink": "Saltar para o conteúdo",
  "admin.nav.activities": "Atividades",
  "admin.nav.overview": "Visão geral",
  "admin.activityManagement": "Gestão de atividades",
  "admin.activityTitlePlaceholder": "Título da atividade",
  "admin.activityTypeLabel": "Tipo de atividade",
  "admin.activityType.respiracao": "Respiração",
  "admin.activityType.meditacao": "Meditação",
  "admin.activityType.mindfulness": "Mindfulness",
  "admin.activityAdd": "Adicionar",
  "admin.activeActivities": "Atividades ativas",
  "admin.overview": "Visão geral",
  "admin.overviewDescription":
   "Esta view agrupa dados globais de administração. Nesta fase mostra apenas o total de atividades.",
  "admin.totalActivities": "Total de atividades:",
  "admin.modal.activityCreated": "Atividade criada",
  "admin.modal.activityCreatedMessage":
   "A nova atividade foi adicionada no servidor (visível para todos).",
  "admin.modal.activityRemoved": "Atividade removida",
  "admin.modal.activityRemovedMessage":
   "A atividade selecionada foi removida da lista.",
  "admin.logout": "Logout",
  "admin.logoutAria": "Terminar sessão",
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
  "topbar.today.subtitle": "Good to see you here.<br />How is your mind today?",
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

export function t(key, params = {}) {
 const language = getLanguage();
 const translation =
  DICTIONARY[language]?.[key] || DICTIONARY[DEFAULT_LANGUAGE][key] || key;
 return String(translation).replace(/\{(\w+)\}/g, (_, name) => {
  return Object.prototype.hasOwnProperty.call(params, name) ?
    params[name]
   : `{${name}}`;
 });
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

 root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
  element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
 });

 root.querySelectorAll("[data-i18n-value]").forEach((element) => {
  element.setAttribute("value", t(element.dataset.i18nValue));
 });
}
