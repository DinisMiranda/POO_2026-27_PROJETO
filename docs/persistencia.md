# Persistencia de dados (Zenify)

## Divisao actual (Opcao B + JSON Server)

| Dado | Onde vive | Notas |
|------|-----------|--------|
| Utilizadores e passwords | `localStorage` (`zenify_users`) | Autenticacao local simplificada (sem JWT) |
| Sessao activa | `localStorage` (`zenify_session`) | `{ id, name, email, role }` |
| Atividades (admin) | **JSON Server** `/activities` | Partilhadas entre utilizadores |
| Check-ins | **JSON Server** `/checkins?userId=` + cache local | Filtrados por utilizador |
| XP / streak | **JSON Server** `/userStats?userId=` + cache local | Um registo por utilizador |
| Dicas (referencia) | `mock/db.json` → `/tips` | Conteudo estatico no mock |

## Porque nao ha `users` no `db.json`

Evita inconsistencia: utilizadores existem **so** no `localStorage`. O `db.json` guarda apenas dados partilhados ou filtrados por `userId`.

## Arranque do mock API

```bash
npx json-server --watch mock/db.json --port 3000
```

Sem o servidor: a area de utilizador usa fallback local para check-ins/stats; o painel admin mostra lista vazia ate o servidor estar activo.

## Evolucao futura (Opcao A)

Migrar autenticacao para `json-server-auth` com JWT em `localStorage` (`token` + `user`), como na F07.
