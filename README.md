# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, CSS custom (`src/css/`), JavaScript (ES modules)
- Autenticacao: `json-server-auth` (JWT) via `POST /login` e `POST /register`
- API mock: JSON Server + auth (`activities`, `checkins`, `userStats`, …)
- Chat: Ollama via `server/chat-api.js` (porta **3002**) — página `src/pages/chatbot.html` — ver [docs/chat-ollama.md](docs/chat-ollama.md)

## Estrutura do projecto

```
/
  index.html              → redirect para src/pages/landing.html
  src/pages/
    landing.html          → entrada pública + login/registo
    dashboard.html        → hoje (área autenticada)
    exercicios.html       → exercícios de calma
    chatbot.html          → assistente IA (Ollama)
    insights.html         → estatísticas
    diario.html           → diário de humor
    perfil.html           → perfil
    settings.html         → configurações
    ajuda.html            → FAQ
    admin.html            → painel de administração

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

### 5. Assistente IA (Ollama) — **obrigatório para o chat**

O assistente está na sidebar (**Assistente** → `chatbot.html`). Usa Ollama local — **não** há respostas pré-escritas quando a IA está offline; a app mostra um aviso honesto.

**Pré-requisitos:** [Ollama](https://ollama.com/download) instalado + `ollama pull llama3.2`

Abre um **terceiro terminal**:

```bash
npm run chat-api
```

Confirma antes da demonstração:

```bash
curl http://localhost:3002/api/health
```

Deve devolver `"ollamaReady": true`.

Guia completo (Windows/macOS/Linux, resolução de problemas): [docs/chat-ollama.md](docs/chat-ollama.md)

Variáveis opcionais: `.env.example` ou `docs/entrega-variaveis-ambiente.txt` (entrega Moodle).

---

## Autenticação

Login e registo usam **json-server-auth** (padrão F07):

- `POST /login` — devolve JWT (`accessToken`)
- `POST /register` — cria conta e devolve JWT
- O token fica em `sessionStorage` e é enviado no header `Authorization`

A password **não** é comparada no browser; o servidor trata o hash (bcrypt).

---

## Credenciais de teste (db.json)

| Perfil | Email | Password | Área |
|--------|-------|----------|------|
| Utilizador | `user@zenify.pt` | `user1234` | Dashboard, exercícios, perfil, … |
| Administrador | `admin@zenify.pt` | `admin1234` | `src/pages/admin.html` |

Para repor estes utilizadores no `db.json`: `npm run seed-db`

---

## Variáveis de ambiente

A app base **não precisa** de `.env`. Só o chat Ollama usa variáveis opcionais — ver `.env.example`.

Para entrega no Moodle, usar o modelo em `docs/entrega-variaveis-ambiente.txt`.

---

## Credenciais antigas (legacy)

| Campo    | Valor             |
|----------|-------------------|
| Email    | `admin@zenify.local` |
| Password | `admin123`        |

(apenas páginas em `legacy/`)

## Fluxo utilizador (frontend PR)

`src/pages/landing.html` → login/registo → `dashboard.html` → restantes páginas via sidebar.

## Legacy

Paginas antigas em `legacy/` — ver [legacy/README.md](legacy/README.md).

Documentacao: [docs/arquitetura-mvc.md](docs/arquitetura-mvc.md) · [docs/persistencia.md](docs/persistencia.md)
