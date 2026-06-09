# Assistente com Ollama (gratuito, local)

O chatbot usa [Ollama](https://ollama.com) no teu Mac — sem API paga nem chaves.

## 1. Instalar Ollama

No macOS, usa a **app oficial** (recomendado):

1. Descarrega em [ollama.com](https://ollama.com) e instala, ou corre `curl -fsSL https://ollama.com/install.sh | sh`
2. Abre a app **Ollama** (fica na barra de menu)
3. No terminal:

```bash
ollama pull llama3.2
```

O servidor fica em `http://localhost:11434` enquanto a app estiver aberta.

## 2. Arrancar o servidor de chat do Zenify

```bash
npm install
npm run chat-api
```

Deves ver `Ollama disponivel.`

Opcional — criar `.env` para mudar modelo ou porta:

```bash
cp .env.example .env
```

```
OLLAMA_MODEL=llama3.2
CHAT_API_PORT=3001
```

## 3. Terminais em desenvolvimento

| Terminal | Comando | Porta |
|----------|---------|-------|
| Frontend | `npx serve .` | variável |
| Dados | `npx json-server --watch db.json --port 3000` | 3000 |
| Ollama | (app em segundo plano após instalar) | 11434 |
| Chat IA | `npm run chat-api` | 3002 |

## Como funciona

1. O browser envia a mensagem para `http://localhost:3001/api/chat`.
2. O servidor Node chama o Ollama local (`/api/chat`).
3. Se o Ollama ou o servidor de chat estiverem offline, o Zenify usa regras fixas (`respondToChat`).

## Verificar

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:

```json
{"ok":true,"provider":"ollama","model":"llama3.2","ollamaReady":true}
```

Testar uma mensagem:

```bash
curl -s http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"estou ansioso antes do exame"}'
```

## Modelos alternativos

Qualquer modelo instalado no Ollama:

```bash
ollama pull mistral
```

No `.env`:

```
OLLAMA_MODEL=mistral
```

## Notas

- A primeira resposta pode demorar mais (o modelo carrega na RAM).
- Funciona offline depois de `ollama pull`.
- Não expõe o modelo ao browser — só o servidor Node fala com o Ollama.
