# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, Tailwind CSS (CDN), JavaScript
- Persistencia: LocalStorage (dados de utilizador e progresso)
- Mock API: JSON Server (catalogo opcional de atividades/dicas)

Ver [docs/persistencia.md](docs/persistencia.md) para a divisao exacta entre localStorage e JSON Server.

## Arquitectura MVC

O frontend esta organizado em **Model – View – Controller** (classes ES6 em `src/js/`).

| Camada | Pasta | Exemplo |
|--------|-------|---------|
| Model | `src/js/models/` | `AppModel`, `ChatbotModel` |
| View | `src/js/views/` | `AppView`, `ModalManager` |
| Controller | `src/js/controllers/` | `app-controller.js` |

Documentacao detalhada: [docs/arquitetura-mvc.md](docs/arquitetura-mvc.md) · [docs/design-inclusivo.md](docs/design-inclusivo.md)

## Estrutura

- `index.html` - pagina publica (visitante)
- `login.html` - autenticacao de utilizadores existentes
- `register.html` - criacao de conta de utilizador (`user`)
- `app.html` - area pessoal do utilizador autenticado
- `admin.html` - painel base de administrador
- `src/js/models` - dados e regras de negocio (auth, app, admin)
- `src/js/views` - manipulacao de DOM, render e utilitarios de interface
- `src/js/controllers` - fluxo da pagina e ligacao entre model e view
- `mock/db.json` - dados iniciais para JSON Server

## Arranque rapido

1. Abrir `index.html` no browser.
2. Criar conta em `register.html` ou entrar em `login.html`.
3. O redirecionamento e feito automaticamente para `app.html` (user) ou `admin.html` (admin).
4. (Opcional) Levantar mock server:

Credenciais admin seeded:

- email: `admin@zenify.local`
- password: `admin123`

Nota: contas de administrador sao pre-definidas e nao podem ser criadas no formulario de registo.

```bash
npx json-server --watch mock/db.json --port 3000
```