# Persistencia: localStorage vs JSON Server

## Resumo para defesa

- **localStorage (activo hoje):** sessao, utilizadores, check-ins, XP/streak e atividades editadas pelo admin.
- **JSON Server (mock opcional):** catalogo inicial de `activities` e `tips` em `mock/db.json` para simular uma API REST.

## O que fica em cada um

| Dado | localStorage | JSON Server (`mock/db.json`) |
|------|--------------|------------------------------|
| Sessao e login | `zenify_session`, `zenify_users` | — |
| Check-ins e gamificacao | `zenify_check_ins`, `zenify_stats` | — |
| Atividades do admin (CRUD) | `zenify_admin_activities` | Seed em `/activities` |
| Dicas por humor | — | Seed em `/tips` |

## Comportamento no codigo

1. A app funciona offline so com localStorage.
2. Com `npx json-server --watch mock/db.json --port 3000`, o `AdminModel` tenta importar atividades do endpoint `/activities` na primeira carga (se localStorage ainda nao tiver dados guardados).
3. Se o servidor nao responder em 2s, mantem-se o fallback local.

## Migracao futura (se perguntarem)

Objectivo de evolucao: mover utilizadores e check-ins para uma API real; manter localStorage apenas como cache offline temporario.
