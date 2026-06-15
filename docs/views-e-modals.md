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

Utilitário de layout usado em admin e configurações.

## Controllers por página

| Página | Controller |
|--------|------------|
| `landing.html` | `landing.js` |
| `dashboard.html` | `dashboard.js` |
| `diario.html` | `diario.js` |
| `exercicios.html` | `exercicios.js` |
| `chatbot.html` | `chatbot.js` |
| `insights.html` | `insights.js` |
| `perfil.html` | `perfil.js` |
| `settings.html` | `settings.js` |
| `admin.html` | `admin.js` |

## Responsabilidades

- **HTML**: estrutura e ids para o controller ligar eventos
- **Controllers**: orquestram API, models e DOM da página
- **Views**: componentes DOM reutilizáveis
- **Models**: regras de negócio
- **data/**: persistência e HTTP
