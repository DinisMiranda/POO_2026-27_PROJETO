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

> ⚠️ **IMPORTANTE — A DB tem de estar ligada antes de abrir o browser.**
> O login faz `fetch` para `http://localhost:3000`. Se o json-server nao estiver ativo, o login falha sempre com "load fail".

### 1. Ligar a base de dados (JSON Server) — **obrigatorio**

Abre um terminal e corre:

```bash
npx json-server --watch db.json --port 3000
```

Deves ver:

```
Resources
  http://localhost:3000/users
  http://localhost:3000/activities
  http://localhost:3000/checkins
  ...

Home
  http://localhost:3000
```

Deixa este terminal aberto enquanto usas a app.

### 2. Servir o frontend — **obrigatorio (terminal separado)**

Abre um **segundo terminal** e corre:

```bash
npx serve . --listen 5500
```

Ou com live-reload (recomendado para desenvolvimento):

```bash
npx live-server --port=5500
```

### 3. Abrir no browser

```
http://localhost:5500/landing.html
```

> Nao abras os ficheiros `.html` directamente pelo sistema de ficheiros (`file://`) — os ES modules e o `fetch` nao funcionam sem um servidor HTTP.

### 4. (Opcional) Chat Ollama

Ver [docs/chat-ollama.md](docs/chat-ollama.md).

---

## Credenciais de teste (db.json)

| Campo    | Valor             |
|----------|-------------------|
| Email    | `dinis@gmail.com` |
| Password | `dinismiranda`    |
| Role     | `user`            |

---

## Fluxo utilizador (frontend PR)

`landing.html` → login/registo → `dashboard.html` → restantes paginas via sidebar.
