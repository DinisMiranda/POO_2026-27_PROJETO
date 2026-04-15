# Zenify

Base inicial do projeto de POO 2026/27 para a aplicacao Zenify, focada em bem-estar emocional e apoio a ansiedade/stress.

## Stack

- Frontend: HTML5, Tailwind CSS (CDN), JavaScript
- Persistencia: LocalStorage
- Mock API: JSON Server

## Estrutura

- `index.html` - pagina publica (visitante)
- `app.html` - area pessoal do utilizador autenticado
- `admin.html` - painel base de administrador
- `src/js/app.js` - logica de diario, recomendacoes e gamificacao
- `src/js/admin.js` - logica base de gestao de atividades
- `mock/db.json` - dados iniciais para JSON Server

## Arranque rapido

1. Abrir `index.html` no browser.
2. Entrar na area pessoal pelo botao "Entrar na app".
3. (Opcional) Levantar mock server:

```bash
npx json-server --watch mock/db.json --port 3000
```