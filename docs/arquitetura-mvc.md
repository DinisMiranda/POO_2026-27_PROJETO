# Arquitectura MVC (Zenify)

## Frase para a defesa

O Zenify segue **MVC em JavaScript**: os **models** guardam dados e regras, as **views** actualizam o DOM, e os **controllers** ligam eventos entre model e view.

## Camadas

```
HTML (*.html)
    ↓ carrega scripts por pagina
Controllers (src/js/controllers/*-controller.js)
    ↓ orquestra
Models (src/js/models/*.js)  ←→  Views (src/js/views/*.js)
```

## Models

| Classe | Responsabilidade |
|--------|------------------|
| `AuthModel` | Utilizadores, sessao, login/registo |
| `AppModel` | Check-ins, XP, streak |
| `RecommendationModel` | Sugestoes por regras (humor + hora) |
| `ChatbotModel` | Respostas if/else do assistente |
| `AdminModel` | CRUD de atividades |
| `ApiClient` | Fetch opcional ao JSON Server |

## Views

| Classe | Responsabilidade |
|--------|------------------|
| `AuthView` | Formularios de login/registo |
| `AppView` | Dashboard, chat, respiracao, historico |
| `AdminView` | Lista e formulario de atividades |
| `ViewManager` | Troca de `data-view` |
| `ModalManager` | Feedback modal reutilizavel |

## Controllers (um por pagina)

| Pagina | Controller |
|--------|------------|
| `login.html` | `login-controller.js` |
| `register.html` | `register-controller.js` |
| `app.html` | `app-controller.js` |
| `admin.html` | `admin-controller.js` |

## Exemplo de fluxo (check-in)

1. Utilizador submete o formulario → `AppView.bindMoodSubmit`
2. `AppController` chama `AppModel.addCheckIn`
3. `RecommendationModel` calcula texto + regra aplicada
4. `AppView.setRecommendation` e `ModalManager.show` actualizam a interface

## POO aplicada

- Cada ficheiro expõe uma **classe** (`class AppModel`, `class AppController`, …).
- **Composicao:** `AppModel` recebe `RecommendationModel`; `AdminModel` recebe `ApiClient`.
- **Separacao de responsabilidades:** sem manipulacao directa de DOM nos models nem regras de negocio nas views.
