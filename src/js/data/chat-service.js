import { CHAT_API } from "./config.js";

export async function askAssistant(message, history = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${CHAT_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("chat_failed");
    }

    const data = await response.json();
    if (!data.reply) {
      throw new Error("empty_reply");
    }

    return data.reply;
  } finally {
    clearTimeout(timeout);
  }
}

export async function isChatApiAvailable() {
  try {
    const response = await fetch(`${CHAT_API}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.ok && data.ollamaReady);
  } catch {
    return false;
  }
}
