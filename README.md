# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, Tailwind CSS (CDN), JavaScript (ES modules)
- Autenticacao: localStorage (Opcao B — utilizadores locais, documentado)
- API mock: JSON Server (`activities`, `checkins`, `userStats`)

Ver [docs/persistencia.md](docs/persistencia.md) para a divisao exacta entre localStorage e JSON Server.

## Arquitectura

```
src/js/
  data/      ← servicos (auth, activities, checkins)
  models/    ← UserProgress (classe) + funcoes puras
  views/     ← modulos funcionais (DOM no topo)
  entries/   ← arranque por pagina (login.js, app.js, …)
```

Documentacao: [docs/arquitetura-mvc.md](docs/arquitetura-mvc.md) · [docs/design-inclusivo.md](docs/design-inclusivo.md)

## Estrutura

- `index.html` - pagina publica (visitante)
- `login.html` / `register.html` - autenticacao
- `app.html` - area do utilizador
- `admin.html` - gestao de atividades (requer JSON Server)
- `src/js/entries/` - ponto de entrada de cada pagina
- `mock/db.json` - dados do JSON Server (sem `users` — ver persistencia)

## Arranque rapido

1. Servir o projecto com um servidor local (modulos ES6 nao funcionam em `file://`):

```bash
npx serve .
```

2. Noutro terminal, levantar o mock API:

```bash
npx json-server --watch mock/db.json --port 3000
```

3. Abrir `http://localhost:3000` (ou a porta do `serve`) → `login.html` ou `register.html`.

Credenciais admin (seed no localStorage na primeira execucao):

- email: `admin@zenify.local`
- password: `admin123`

Nota: contas de administrador nao podem ser criadas no registo. Utilizadores normais registam-se em `register.html`.
