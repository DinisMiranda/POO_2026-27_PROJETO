# Persistencia de dados (Zenify)

## Divisao actual

| Dado | Onde vive | Notas |
|------|-----------|--------|
| Utilizadores e passwords | `db.json` → `/users` | Hash bcrypt via json-server-auth |
| Sessao + JWT | `sessionStorage` (`zenify_user`) + token em memória | Ver `auth-token.js` |
| Check-ins | `/checkins` | Filtrados por `userId` |
| Humor (diário) | `/moodLogs` | Um ou mais registos por dia |
| XP / streak / medalhas | `/userProgress` | `ProgressService` + entidade `Progress` |
| Exercícios, desafios, dicas | `/activities`, `/challenges`, `/tips` | Conteúdo gerido no admin |

## Arranque da API

```bash
npm run data
```

Sem o servidor, login e páginas autenticadas falham (comportamento esperado).

## Seed de utilizadores de teste

```bash
npm run seed-db
```

Credenciais: `user@zenify.pt` / `user1234` e `admin@zenify.pt` / `admin1234`.
