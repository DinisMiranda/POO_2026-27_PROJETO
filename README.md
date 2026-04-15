# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, Tailwind CSS (CDN), JavaScript
- Persistencia: LocalStorage
- Mock API: JSON Server

## Estrutura

- `index.html` - pagina publica (visitante)
- `login.html` - autenticacao de utilizadores existentes
- `register.html` - criacao de conta com role (`user` ou `admin`)
- `app.html` - area pessoal do utilizador autenticado
- `admin.html` - painel base de administrador
- `src/js/auth.js` - registo, login, sessao e controlo de acesso por role
- `src/js/app.js` - logica de diario, recomendacoes e gamificacao
- `src/js/admin.js` - logica base de gestao de atividades
- `mock/db.json` - dados iniciais para JSON Server

## Arranque rapido

1. Abrir `index.html` no browser.
2. Criar conta em `register.html` ou entrar em `login.html`.
3. O redirecionamento e feito automaticamente para `app.html` (user) ou `admin.html` (admin).
4. (Opcional) Levantar mock server:

Credenciais admin seeded:

- email: `admin@zenify.local`
- password: `admin123`

```bash
npx json-server --watch mock/db.json --port 3000
```