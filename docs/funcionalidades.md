# Como funcionam as principais funcionalidades (Zenify)

Documento de referência que explica o fluxo técnico das funcionalidades centrais da aplicação: autenticação, sessão, dados guardados e interação com a API.

---

## 1. Visão geral

A Zenify é uma SPA (Single Page Application) em JavaScript modular:

```
Browser (src/pages/*.html)
    │
    ├─► JSON Server + json-server-auth  (porta 3000)  → dados e login
    │
    └─► chat-api (porta 3002)  → proxy para Ollama (assistente IA)
```

Cada página HTML carrega um **controller** (`src/js/controllers/`) que:

1. Valida a sessão (se for área autenticada).
2. Chama **serviços** em `src/js/data/` para ler/escrever dados.
3. Delega a renderização à **view** correspondente em `src/js/views/`.

A password **nunca** é validada no browser. O servidor (`json-server-auth`) compara o hash bcrypt e devolve um JWT.

---

## 2. Login e registo

### 2.1 Fluxo do login

```
Utilizador preenche email + password (landing.html)
        │
        ▼
landing.js → UserService.login()
        │
        ▼
http.js → POST http://localhost:3000/login
        │
        ▼
json-server-auth valida credenciais
        │
        ▼
Resposta: { accessToken, user }
        │
        ▼
auth-token.js guarda o token
UserService.saveSession() guarda o perfil
        │
        ▼
redirectByRole() → dashboard.html (user) ou admin.html (admin)
```

### 2.2 Fluxo do registo

Semelhante ao login, mas usa `POST /register` com nome, email, password e data de nascimento. O servidor cria o utilizador em `db.json` → coleção `users` e devolve também um JWT.

### 2.3 O que fica guardado no browser

| Chave | Onde | Conteúdo |
|-------|------|----------|
| `zenify_token` | `sessionStorage` | JWT (`accessToken`) devolvido pelo servidor |
| `zenify_user` | `sessionStorage` | Objeto JSON do utilizador **sem password** (id, email, nome, role, …) |

Ficheiros responsáveis:

- `src/js/data/auth-token.js` — ler/gravar/limpar o token
- `src/js/data/user-service.js` — ler/gravar/limpar a sessão do utilizador
- `src/js/data/http.js` — pedidos de login/registo e `apiFetch`

### 2.4 O que é o token (JWT)

O JWT é uma string assinada pelo servidor com três partes separadas por `.` (cabeçalho, payload, assinatura).

O browser **não valida a assinatura** — apenas extrai o payload para obter o `id` do utilizador quando necessário (`parseAuthToken` em `auth-token.js`).

Em cada pedido autenticado à API, o token vai no header:

```
Authorization: Bearer <zenify_token>
```

Isto é feito automaticamente por `apiFetch()` em `http.js`.

### 2.5 Porque `sessionStorage` e não `localStorage`

- `sessionStorage` é apagado quando o separador do browser fecha → sessão mais segura para uma app académica.
- O idioma da app (`zenify_lang`) usa `localStorage` porque é uma preferência que deve persistir entre visitas (ver secção 10).

### 2.6 Terminar sessão

Ao clicar em «Terminar sessão» (topbar ou perfil):

```js
UserService.clearSession()
```

Remove `zenify_user`, `zenify_token` e redireciona para `landing.html`.

---

## 3. Proteção das páginas autenticadas

Páginas como `dashboard.html`, `diario.html`, `exercicios.html`, etc. começam o controller com:

```js
const user = await requireSession();
if (!user) return; // já foi redirecionado
```

`requireSession()` (`src/js/data/session.js`):

1. Lê `zenify_user` e `zenify_token` do `sessionStorage`.
2. Opcionalmente refresca o perfil com `GET /users/:id`.
3. Se o token for inválido (401/403), limpa a sessão.
4. Se não houver sessão válida, redireciona para `landing.html`.

**Nota:** a proteção é feita no **frontend**. O JSON Server também exige JWT nas rotas protegidas, mas a barreira principal para o utilizador é o redirect nas páginas.

---

## 4. Comunicação com a API de dados

### 4.1 URL base

`src/js/data/config.js` define:

```js
API = http://localhost:3000   // ou o hostname actual (127.0.0.1 → localhost)
CHAT_API = http://localhost:3002
```

### 4.2 Funções de pedido

| Função | Ficheiro | Uso |
|--------|----------|-----|
| `apiFetch(path, options)` | `http.js` | Pedido genérico com JWT e timeout de 2,5 s |
| `apiFetchJson(path, options)` | `http.js` | Igual, mas devolve JSON e lança erro se falhar |

Todas as operações de dados passam por aqui — controllers **não** fazem `fetch` directo à API (excepto login/registo inicial).

### 4.3 Onde vivem os dados (`db.json`)

| Coleção | O que guarda |
|---------|----------------|
| `users` | Contas (email, password hash, role, nome, …) |
| `userProgress` | XP, nível, streak, desafios completos, medalhas |
| `checkins` | Registo histórico de check-ins |
| `moodLogs` | Humor diário (1–5) + nota opcional |
| `journalEntries` | Registos do diário (título + texto) |
| `activities` | Exercícios disponíveis |
| `challengeDefinitions` | Desafios gamificados |
| `medalDefinitions` | Medalhas |
| `userNotifications` | Notificações guardadas por utilizador |

---

## 5. Dashboard (Hoje)

**Página:** `dashboard.html` · **Controller:** `dashboard.js` · **View:** `dashboard-view.js`

### 5.1 Check-in diário

1. O utilizador clica em «Fazer check-in».
2. Abre o modal de humor (`#checkin-mood-modal`) — escolhe valor de 1 a 5.
3. O controller chama:
   - `ProgressService.doCheckin(userId)` → actualiza streak em `/userProgress`
   - `saveMoodLog(userId, mood)` → grava ou actualiza humor do dia em `/moodLogs`
4. A view mostra feedback e actualiza streak, XP e gráfico de humor.

### 5.2 Streak

A streak conta dias **consecutivos** com check-in:

- Se o último check-in foi **ontem** → streak + 1.
- Se foi **hoje** → já feito (não duplica).
- Se passou mais de um dia → streak volta a 0 (`syncStreak`).

### 5.3 Desafios e medalhas no dashboard

Ao carregar, o dashboard sincroniza automaticamente:

- `ProgressService.syncChallenges()` — verifica se algum desafio foi cumprido e atribui XP.
- `ProgressService.syncMedals()` — desbloqueia medalhas cujas condições foram atingidas.

O utilizador pode também **adicionar manualmente** desafios/medalhas pendentes através do modal `#achievement-modal`.

---

## 6. Diário

**Página:** `diario.html` · **Controller:** `diario.js` · **Views:** `diario-view.js` + `chatbot-view.js`

O diário tem **duas áreas** na mesma página:

### 6.1 Assistente IA (coluna esquerda)

- Usa `chat-service.js` → `POST http://localhost:3002/api/chat`
- **Não usa o JWT** da app — é um serviço separado (Ollama local).
- O histórico da conversa fica **só em memória** (array `chatHistory` no controller); não é guardado em `db.json`.
- Se Ollama ou `npm run chat-api` estiverem offline, mostra aviso «Assistente indisponível».

### 6.2 Registos do diário (coluna direita)

1. O utilizador preenche título + texto.
2. `journal-service.js` faz `POST /journalEntries` com `userId`, `date`, `title`, `body`, `createdAt`.
3. A grelha de cartões actualiza; ao clicar num cartão abre o modal `#journal-modal` com o texto completo.

**Diferença entre `moodLogs` e `journalEntries`:**

| | `moodLogs` | `journalEntries` |
|---|-----------|------------------|
| Origem | Check-in no dashboard, exercício de gratidão | Formulário do diário |
| Campos | humor (1–5) + nota curta | título + texto longo |
| Uso | Gráficos, insights, estado mental | Diário pessoal com histórico |

---

## 7. Exercícios

**Página:** `exercicios.html` · **Controller:** `exercicios.js` · **View:** `exercicios-view.js`

### 7.1 Fluxo

1. A grelha lista actividades de `/activities`.
2. Ao clicar «Iniciar», abre `#exercise-modal` com um **player** (`exercise-players.js`) conforme o tipo:
   - respiração, meditação, relaxamento, movimento, diário de gratidão, …
3. Quando o exercício está completo, o botão «Concluir exercício» activa-se.
4. Ao concluir:
   - `ProgressService.completeActivity(userId, tipo)` → +10 XP em `/userProgress`
   - Regista o tipo em `activityTypes` (se for novo)
   - `syncChallenges()` e `syncMedals()`
5. Fecha o modal do exercício e abre `#exercise-xp-modal` com a recompensa.

### 7.2 XP por exercício

Cada conclusão dá **+10 XP**. O nível calcula-se com 100 XP por nível (`Progress.calcLevel` em `models/Progress.js`).

---

## 8. Perfil

**Página:** `perfil.html` · **Controller:** `perfil.js` · **View:** `perfil-view.js`

Mostra:

- Dados do utilizador (nome, email)
- Barra de XP e nível actual
- Desafios activos e medalhas desbloqueadas
- Botão para terminar sessão

Os dados vêm de `UserService.getSession()` (local) e `ProgressService.getProgress()` (API).

---

## 9. Insights

**Página:** `insights.html` · **Controller:** `insights.js`

Agrega dados do utilizador:

- `userProgress` → XP, streak, tipos de exercício feitos
- `moodLogs` → média de humor

As recomendações são geradas localmente por regras em `utils/insights-rules.js` (sem IA).

---

## 10. Configurações

**Página:** `settings.html` · **Controller:** `settings.js`

Permite mudar o idioma (pt-PT / en). A escolha guarda-se em:

```
localStorage → zenify_lang
```

Ao guardar, a página reaplica traduções via `i18n.js` (`data-i18n` nos elementos HTML).

**Nota:** as configurações **não exigem login** no código actual — qualquer pessoa pode aceder à página, mas sem sessão a sidebar não mostra dados de utilizador.

---

## 11. Notificações

**View:** `notifications-view.js` · **Serviço:** `notifications-service.js`

O ícone de sino no topbar abre um modal (`.notif-modal`) criado dinamicamente.

As notificações são uma mistura de:

1. Registos em `/userNotifications` (se existirem).
2. Notificações **geradas em tempo real** a partir do progresso (medalhas, desafios).
3. Uma dica aleatória de templates locais (não é IA).

---

## 12. Painel de administração

**Página:** `admin.html` · **Controller:** `admin.js`

- Só acessível a utilizadores com `role: "admin"`.
- Após login, `redirectByRole()` envia admins directamente para `admin.html`.
- CRUD de utilizadores, exercícios, desafios, medalhas e dicas via `admin-service.js`.
- Usa `view-manager.js` para alternar tabs sem mudar de página.

Credencial de teste: `admin@zenify.pt` / `admin1234`

---

## 13. Resumo: o que fica onde

| Dado | Persistência | Duração |
|------|--------------|---------|
| JWT (`zenify_token`) | `sessionStorage` | Até fechar o separador ou logout |
| Perfil (`zenify_user`) | `sessionStorage` | Idem |
| Idioma (`zenify_lang`) | `localStorage` | Permanente no browser |
| XP, streak, medalhas | `db.json` → API | Permanente (servidor) |
| Humor, diário, check-ins | `db.json` → API | Permanente (servidor) |
| Histórico do chat IA | Memória JS | Só durante a visita à página |

---

## 14. Diagrama da autenticação

```
┌─────────────┐     POST /login      ┌──────────────────┐
│   Browser   │ ──────────────────►  │ json-server-auth │
│  landing.js │ ◄──────────────────  │    (porta 3000)  │
└─────────────┘   accessToken + user └──────────────────┘
       │
       │  sessionStorage.setItem("zenify_token", …)
       │  sessionStorage.setItem("zenify_user", …)
       ▼
┌─────────────┐   GET /userProgress   ┌──────────────────┐
│ dashboard   │ ───────────────────►  │   JSON Server    │
│  .js        │  Authorization:       │    db.json       │
│             │  Bearer <token>       └──────────────────┘
└─────────────┘
```

---

## 15. Ficheiros-chave por tema

| Tema | Ficheiros |
|------|-----------|
| Login / registo | `controllers/landing.js`, `data/http.js`, `data/user-service.js` |
| Token JWT | `data/auth-token.js` |
| Guard de sessão | `data/session.js` |
| Pedidos API | `data/http.js`, `data/config.js` |
| Progresso / XP | `data/progress-service.js`, `models/Progress.js` |
| Humor / check-in | `data/mood-service.js`, `controllers/dashboard.js` |
| Diário | `data/journal-service.js`, `controllers/diario.js` |
| Exercícios | `controllers/exercicios.js`, `views/exercise-players.js` |
| Chat IA | `data/chat-service.js`, `server/chat-api.js` |
| Layout | `views/app-shell.js`, `views/sidebar-view.js`, `views/topbar-view.js` |

Para arranque dos servidores e variáveis de ambiente, ver [README.md](../README.md) e [chat-ollama.md](chat-ollama.md).
