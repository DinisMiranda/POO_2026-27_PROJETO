# Assistente Zenify (Ollama)

O chat da app principal (`src/pages/chatbot.html`, link **Assistente** na sidebar) usa um modelo de linguagem **local** via [Ollama](https://ollama.com).

## Arquitetura

```
Browser  →  chat-api (Node, porta 3002)  →  Ollama (porta 11434)
```

O modelo **nunca** é exposto ao browser — só o servidor `server/chat-api.js` fala com o Ollama.

Se o Ollama ou o `chat-api` não estiverem disponíveis, o assistente **mostra um aviso** e não simula conversa com respostas fixas.

---

## Requisitos

- Node.js 18+ (já necessário para o projeto)
- [Ollama](https://ollama.com/download) instalado (Windows, macOS ou Linux)
- Modelo `llama3.2` descarregado (`ollama pull llama3.2`)

---

## Instalação do Ollama

### Windows / macOS / Linux

1. Descarrega o instalador em [ollama.com/download](https://ollama.com/download) e instala.
2. Confirma que o serviço está a correr (ícone na barra de tarefas / menu, ou processo `ollama` ativo).
3. No terminal:

```bash
ollama pull llama3.2
```

O servidor fica em `http://localhost:11434`.

### Verificar Ollama

```bash
curl http://localhost:11434/api/tags
```

Deves ver `llama3.2` (ou o modelo que configuraste) na lista.

---

## Arranque completo (avaliação / demonstração)

São **quatro** processos em paralelo:

| Terminal | Comando | Porta |
|----------|---------|-------|
| 1 — API de dados | `npm run data` | 3000 |
| 2 — Frontend | `npm run web` | 5000 |
| 3 — Chat API | `npm run chat-api` | **3002** |
| 4 — Ollama | (app/serviço em segundo plano) | 11434 |

Depois:

1. Abre `http://localhost:5000/`
2. Inicia sessão (`user@zenify.pt` / `user1234`)
3. Sidebar → **Assistente**

### Verificar o chat antes da demo

```bash
curl http://localhost:3002/api/health
```

Resposta esperada:

```json
{"ok":true,"provider":"ollama","model":"llama3.2","ollamaReady":true}
```

Se `ollamaReady` for `false`, corre `ollama pull llama3.2` e confirma que o Ollama está ativo.

Testar uma mensagem:

```bash
curl -s http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"estou ansioso antes do exame"}'
```

---

## Configuração opcional (`.env`)

A app base não precisa de `.env`. Para personalizar o chat, copia `.env.example` para `.env` na raiz:

```
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CHAT_API_PORT=3002
```

**Importante:** frontend (`src/js/data/config.js`) e servidor (`server/chat-api.js`) usam a porta **3002** por defeito. Se mudares `CHAT_API_PORT`, mantém os dois alinhados.

Para entrega no Moodle (sem commitar `.env`), usar `docs/entrega-variaveis-ambiente.txt`.

---

## Modelos alternativos

```bash
ollama pull mistral
```

No `.env`:

```
OLLAMA_MODEL=mistral
```

Reinicia `npm run chat-api` após alterar o `.env`.

---

## Resolução de problemas

| Sintoma | Solução |
|---------|---------|
| «Assistente indisponível» na app | Arranca `npm run chat-api` e confirma Ollama ativo |
| `ollamaReady: false` no health | `ollama pull llama3.2` |
| Erro de rede no browser | Confirma porta **3002** (não 3001) |
| Primeira resposta lenta | Normal — o modelo carrega para RAM na primeira vez |
| Chat não aparece | Usa a app em `src/pages/` (sidebar **Assistente**), não `legacy/` |

---

## Notas

- Funciona offline depois de `ollama pull`.
- Não há fallback com respostas pré-escritas — o comportamento é intencional para não simular IA quando o motor não está disponível.
- A implementação legacy (`legacy/app.html`) mantém regras fixas apenas como MVP antigo; a app apresentada usa Ollama.
