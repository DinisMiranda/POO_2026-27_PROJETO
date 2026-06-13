# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, CSS custom (`src/css/`), JavaScript (ES modules)
- Autenticacao: landing page + `userModel.js` (PR frontend) e auth localStorage (legacy)
- API mock: JSON Server (`activities`, `checkins`, `userStats`)
- Chat (main): Ollama via `server/chat-api.js` — ver [docs/chat-ollama.md](docs/chat-ollama.md)

## Estrutura do projecto

```
/
  index.html              → redirect para landing
  landing.html            → entrada publica + login/registo
  dashboard.html          → hoje (area autenticada)
  registo.html            → diario de humor
  exercicios.html         → exercicios de calma
  insights.html           → estatisticas
  comunidade.html         → feed
  perfil.html             → perfil
  settings.html           → configuracoes
  ajuda.html              → FAQ
  admin.html              → painel admin (MVP antigo)

  legacy/                 → MVP Tailwind (app, login, register)
  src/
    css/
      app.css             → layout dashboard + sidebar
      landing.css         → landing page
      auth.css            → formularios auth
      af.css              → a11y (skip link, foco)
    js/
      controllers/        → arranque por pagina
      views/              → DOM + eventos
      models/             → dominio
      data/               → servicos API/localStorage
      zenify/sidebar.js   → navegacao lateral
  server/chat-api.js      → proxy Ollama
  db.json                 → JSON Server
  docs/                   → documentacao
```

## Arranque rapido

1. Servir o projecto:

```bash
npx serve .
```

2. Mock API:

```bash
npx json-server --watch db.json --port 3000
```

3. (Opcional) Chat Ollama — [docs/chat-ollama.md](docs/chat-ollama.md)

4. Abrir `http://localhost:3000` → `landing.html`

## Fluxo utilizador (frontend PR)

`landing.html` → login/registo → `dashboard.html` → restantes paginas via sidebar.

## Legacy

Paginas antigas em `legacy/` — ver [legacy/README.md](legacy/README.md).

Credenciais admin seed (legacy localStorage):

- email: `admin@zenify.local`
- password: `admin123`

Documentacao: [docs/arquitetura-mvc.md](docs/arquitetura-mvc.md) · [docs/persistencia.md](docs/persistencia.md)
