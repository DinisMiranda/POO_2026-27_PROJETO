# Arquitectura do frontend (Zenify)

## Frase para a defesa

O Zenify usa **modulos ES6 funcionais** para views e arranque, **servicos em `data/`** para persistencia, e **uma classe de dominio** (`UserProgress`) onde o estado por utilizador faz sentido.

## Estrutura

```
src/js/
  data/           ← servicos (auth, activities, checkins) — falam com localStorage/API
  models/         ← dominio: UserProgress + funcoes puras (chatbot, recommendation)
  views/          ← DOM: selectors no topo, funcoes exportadas
  entries/        ← ponto de entrada por pagina (login.js, app.js, …)
```

## Porque as Views nao sao classes

Cada instancia de `AuthView` seria identica — sem estado proprio. Os selectors DOM correm **uma vez** no topo do modulo; as funcoes exportadas manipulam esses elementos.

## Porque os Controllers deram lugar a `entries/`

Cada HTML carrega um unico `<script type="module" src="…/entries/app.js">`. Esse ficheiro coordena servicos + views — sem `new AppController()` no fim do proprio controller.

## Classe legitima: `UserProgress`

Representa **uma coisa** com estado proprio (`#xp`, `#streak`, `#lastDate`) e metodos que o modificam (`applyCheckInReward`, `computeBadge`).

## Servicos vs models

| Ficheiro | Papel |
|----------|--------|
| `auth-service.js` | Onde os utilizadores “vivem” (localStorage) |
| `activity-service.js` | CRUD de atividades no JSON Server |
| `app-service.js` | Check-ins e stats com `userId` |
| `UserProgress.js` | Regras de gamificacao |

## Fluxo de check-in (`entries/app.js`)

1. `bindMoodSubmit` (view) → entrada
2. `addCheckin` (app-service) → servidor ou cache local
3. `progress.applyCheckInReward` (model) → XP/streak + recomendacao
4. `saveStats` + `renderDashboard` (service + view)
