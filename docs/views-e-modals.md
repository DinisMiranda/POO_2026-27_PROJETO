# Views e navegação

## Ideia geral

- Cada página em `src/pages/` tem layout com sidebar + topbar + conteúdo.
- A sidebar e o topbar são montados por módulos partilhados.
- O painel **admin** usa tabs internas com `view-manager.js`.

## Ficheiros partilhados

### `src/js/views/sidebar-view.js`

Monta a navegação lateral conforme `data-zenify-page` e o papel do utilizador (link Admin só para `role: admin`).

### `src/js/views/topbar-view.js`

Título e subtítulo da página via i18n (`src/js/data/i18n.js`).

### `src/js/views/view-manager.js`

Usado em `admin.html`: alterna entre tabs (utilizadores, exercícios, desafios, …).

### `src/js/views/app-shell.js`

Monta sidebar + topbar nas páginas autenticadas.

### `src/js/views/notifications-view.js`

Modal de notificações (ícone no topbar), criado dinamicamente no DOM.

## Controllers por página

| Página | Controller | View principal |
|--------|------------|----------------|
| `landing.html` | `landing.js` | `landingView.js` |
| `dashboard.html` | `dashboard.js` | `dashboard-view.js` |
| `diario.html` | `diario.js` | `diario-view.js` + `chatbot-view.js` |
| `exercicios.html` | `exercicios.js` | `exercicios-view.js` |
| `insights.html` | `insights.js` | `insights-view.js` |
| `perfil.html` | `perfil.js` | `perfil-view.js` |
| `settings.html` | `settings.js` | `settings-view.js` |
| `admin.html` | `admin.js` | `admin-view.js` |
| `ajuda.html` | `ajuda.js` | — |
| `chatbot.html` | — | redireciona para `diario.html` |

## Modais

| Modal | Página | ID / origem | Função |
|-------|--------|-------------|--------|
| Check-in de humor | Dashboard | `#checkin-mood-modal` | Escolher humor antes de registar check-in |
| Adicionar conquista | Dashboard | `#achievement-modal` | Escolher desafio ou medalha pendente |
| Exercício | Exercícios | `#exercise-modal` | Player guiado (respiração, meditação, …) |
| Recompensa XP | Exercícios | `#exercise-xp-modal` | Feedback ao concluir exercício |
| Registo do diário | Diário | `#journal-modal` | Ler registo completo ao clicar no cartão |
| Notificações | Topbar (global) | `.notif-modal` | Lista de notificações do utilizador |

Todos os modais de conquistas reutilizam a classe `.achievement-modal` em `app.css`. O modal do diário usa `.journal-modal`.

## Responsabilidades

- **HTML**: estrutura e ids para o controller ligar eventos
- **Controllers**: orquestram API, models e views (sem manipular DOM directamente)
- **Views**: renderização e eventos DOM
- **Models**: regras de negócio (`Progress.js`)
- **data/**: persistência e HTTP
