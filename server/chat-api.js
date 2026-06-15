import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "..", ".env") });

const PORT = Number(process.env.CHAT_API_PORT) || 3002;
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const SYSTEM_PROMPT = `És o assistente Zenify para estudantes universitários em Portugal.

REGRA DE LÍNGUA (obrigatória):
- Responde SEMPRE em português de Portugal (pt-PT), nunca em português do Brasil.
- Usa vocabulário europeu (ex.: telemóvel, autocarro, combinação, ficheiro, aplicação).
- Trata o utilizador por "tu" (ex.: "podes", "o teu humor", "experimenta").
- Evita expressões brasileiras (ex.: "você", "celular", "ônibus", "está bem?", "a gente").

Conteúdo:
- Foca em ansiedade académica, stress, sono, hábitos de estudo e bem-estar.
- Respostas curtas (máximo 4 frases), empáticas e práticas.
- Não dês diagnósticos médicos; sugere ajuda profissional se houver risco de autolesão.
- Menciona funcionalidades da app quando relevante: diário de humor, exercícios de calma, gamificação.`;

const app = express();
app.use(cors());
app.use(express.json());

function buildMessages(message, history) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history
      .filter((entry) => entry?.role && entry?.content)
      .slice(-10)
      .map((entry) => ({
        role: entry.role === "assistant" ? "assistant" : "user",
        content: String(entry.content),
      })),
    { role: "user", content: message },
  ];
}

async function isOllamaReady() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;

    const data = await response.json();
    const models = (data.models || []).map((entry) => entry.name);
    return models.some(
      (name) => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`)
    );
  } catch {
    return false;
  }
}

async function askOllama(messages) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 300,
      },
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "ollama_error");
  }

  const data = await response.json();
  const reply = data.message?.content?.trim();
  if (!reply) throw new Error("empty_reply");
  return reply;
}

app.get("/api/health", async (_req, res) => {
  const ollamaReady = await isOllamaReady();
  res.json({
    ok: true,
    provider: "ollama",
    model: OLLAMA_MODEL,
    ollamaUrl: OLLAMA_URL,
    ollamaReady,
  });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ error: "empty_message" });
  }

  const ready = await isOllamaReady();
  if (!ready) {
    return res.status(503).json({
      error: "ollama_unavailable",
      hint: `Arranca o Ollama e corre: ollama pull ${OLLAMA_MODEL}`,
    });
  }

  try {
    const reply = await askOllama(buildMessages(message, history));
    res.json({ reply });
  } catch (error) {
    res.status(502).json({
      error: "ollama_error",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
});

app.listen(PORT, async () => {
  const ready = await isOllamaReady();
  console.log(`Zenify chat API em http://localhost:${PORT}`);
  console.log(`Ollama: ${OLLAMA_URL} | modelo: ${OLLAMA_MODEL}`);
  console.log(
    ready
      ? "Ollama disponivel."
      : `AVISO: Ollama offline ou modelo em falta. Corre: ollama pull ${OLLAMA_MODEL}`
  );
});
