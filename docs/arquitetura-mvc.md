# Arquitectura do frontend (Zenify)

## Frase para a defesa

O Zenify usa **módulos ES6** com controllers por página, **views** para DOM partilhado (sidebar, topbar) e **models/serviços** para regras de negócio e persistência via json-server-auth.

## Estrutura

```
src/js/
  controllers/    ← arranque por página (dashboard.js, diario.js, …)
  views/          ← DOM reutilizável (sidebar-view, topbar-view, admin-view, …)
  models/         ← domínio (progressModel, streakModel, recommendation, …)
  data/           ← HTTP, sessão, config, serviços admin/chat
```

## Arranque por página

Cada HTML em `src/pages/` carrega um ou mais `<script type="module">`:

- `sidebar-view.js` + `topbar-view.js` nas páginas autenticadas
- um controller específico (`dashboard.js`, `exercicios.js`, …)
- `landing.js` na entrada pública (login/registo integrado)

## Models principais

| Ficheiro | Papel |
|----------|--------|
| `progressModel.js` | XP, desafios, medalhas |
| `streakModel.js` | Check-ins e streak |
| `recommendation.js` | Sugestões por humor e hora do dia |
| `userModel.js` | Sessão JWT + perfil |

## Serviços (`data/`)

| Ficheiro | Papel |
|----------|--------|
| `http.js` | `apiFetch`, login/registo |
| `session.js` | `requireSession()` nas páginas protegidas |
| `activity-service.js` | Exercícios/atividades |
| `admin-service.js` | CRUD do painel admin |
| `chat-service.js` | Proxy para Ollama (`server/chat-api.js`) |

## Fluxo de check-in (exemplo)

1. Utilizador escolhe humor no **Dashboard** ou **Diário**
2. Controller grava em `moodLogs` (e `checkins` no primeiro registo do dia)
3. `StreakModel.doCheckin` atualiza streak
4. `ProgressModel` sincroniza desafios e medalhas
