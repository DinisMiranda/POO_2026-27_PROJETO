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
  index.html              → redirect para src/pages/landing.html
  src/pages/
    landing.html          → entrada pública + login/registo
    dashboard.html        → hoje (área autenticada)
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

### 1. Instalar dependências

```bash
npm install
```

### 2. Ligar a base de dados (JSON Server) — **obrigatório**

Abre um terminal e corre:

```bash
npm run data
```

Deixa este terminal aberto enquanto usas a app.

### 3. Servir o frontend — **obrigatório (terminal separado)**

Abre um **segundo terminal** e corre:

```bash
npm run web
```

### 4. Abrir no browser

```
http://localhost:5000/
```

O `index.html` na raiz reencaminha para a landing. Não uses a porta 3000 para o frontend — essa porta é do json-server.

> Não abras os ficheiros `.html` directamente pelo sistema de ficheiros (`file://`) — os ES modules e o `fetch` não funcionam sem um servidor HTTP.

### 5. (Opcional) Chat Ollama

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

`src/pages/landing.html` → login/registo → `dashboard.html` → restantes páginas via sidebar.

## Legacy

Paginas antigas em `legacy/` — ver [legacy/README.md](legacy/README.md).

Credenciais admin seed (legacy localStorage):

- email: `admin@zenify.local`
- password: `admin123`

Documentacao: [docs/arquitetura-mvc.md](docs/arquitetura-mvc.md) · [docs/persistencia.md](docs/persistencia.md)
