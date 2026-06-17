# Arquitectura do frontend (Zenify)

## Frase para a defesa

O Zenify usa **módulos ES6** com separação por camadas: **controllers** coordenam o fluxo, **views** tratam do DOM, **models** encapsulam entidades de domínio, **data/** acede à API e **utils/** contém lógica pura.

## Estrutura

```
src/js/
  controllers/    ← coordenação por página (sem DOM directo)
  views/          ← DOM e renderização (landingView, dashboard-view, …)
  models/         ← entidades de domínio (ex.: Progress com campos privados)
  data/           ← serviços HTTP, sessão, config
  utils/          ← funções puras (recomendações, regras de insights)
```

## Padrão por página

1. O **controller** valida sessão, chama serviços e models.
2. A **view** recebe dados e actualiza o HTML.
3. Os **serviços** em `data/` usam `http.js` + `config.js` (sem URLs hardcoded).

Cada página autenticada segue este par: `dashboard.js` + `dashboard-view.js`, `diario.js` + `diario-view.js`, `exercicios.js` + `exercicios-view.js`, `settings.js` + `settings-view.js`, `perfil.js` + `perfil-view.js`, `insights.js` + `insights-view.js`.

O **Diário** reutiliza `chatbot-view.js` para o assistente Ollama embutido na página (não há página separada na sidebar). `chatbot.html` apenas redireciona para `diario.html`.

Exemplo de referência: `landing.js` + `landingView.js`.

## Models

| Ficheiro | Papel |
|----------|--------|
| `Progress.js` | Entidade de progresso (XP, nível, desafios, medalhas) com `#record` privado |

## Serviços (`data/`)

| Ficheiro | Papel |
|----------|--------|
| `http.js` | `apiFetch` / `apiFetchJson`, login/registo |
| `user-service.js` | Sessão JWT + perfil |
| `progress-service.js` | CRUD e fluxos de `userProgress` |
| `notifications-service.js` | Notificações do utilizador |
| `mood-service.js` | `moodLogs` e `checkins` |
| `journal-service.js` | Registos do diário (`journalEntries`) |
| `activity-service.js` | Exercícios/atividades |
| `admin-service.js` | CRUD do painel admin |
| `chat-service.js` | Proxy Ollama |

## Utils (`utils/`)

| Ficheiro | Papel |
|----------|--------|
| `recommendation.js` | Sugestões por humor e hora do dia |
| `mental-state.js` | Estado mental semanal a partir de mood logs |
| `insights-rules.js` | Recomendações da página insights |

## Fluxo de check-in

1. Utilizador escolhe humor no **Dashboard** ou **Diário**
2. Controller grava em `moodLogs` via `mood-service`
3. `ProgressService.doCheckin` actualiza streak
4. `ProgressService` sincroniza desafios e medalhas
5. `DashboardView` reflecte o novo estado
