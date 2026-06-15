import {
 askAssistant,
 ChatUnavailableError,
 isChatApiAvailable,
} from "../data/chat-service.js";
import { requireSession } from "../data/session.js";

const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSubmit = document.getElementById("chat-submit");
const chatStatus = document.getElementById("chat-status");
const chatUnavailable = document.getElementById("chat-unavailable");

let chatHistory = [];
let ollamaReady = false;

const WELCOME_ONLINE =
 "Olá! Sou o assistente Zenify. Pergunta sobre ansiedade, stress, sono, hábitos de estudo ou exercícios de bem-estar.";

const UNAVAILABLE_MESSAGE =
 "O assistente com IA não está disponível. Confirma que o Ollama está a correr e que executaste `npm run chat-api` (porta 3002). Tenta novamente mais tarde.";

function appendMessage(author, text) {
 if (!chatLog) return;

 const el = document.createElement("div");
 el.className = `chat-bubble chat-bubble--${author}`;

 const label = document.createElement("span");
 label.className = "chat-bubble-author";
 label.textContent = author === "user" ? "Tu" : "Zenify";

 const body = document.createElement("p");
 body.textContent = text;

 el.append(label, body);
 chatLog.appendChild(el);
 chatLog.scrollTop = chatLog.scrollHeight;
}

function replaceLastBotMessage(text) {
 if (!chatLog) return;

 const bubbles = chatLog.querySelectorAll(".chat-bubble--bot");
 const last = bubbles[bubbles.length - 1];
 const body = last?.querySelector("p");
 if (body) body.textContent = text;
 chatLog.scrollTop = chatLog.scrollHeight;
}

function setFormEnabled(enabled) {
 if (chatInput) chatInput.disabled = !enabled;
 if (chatSubmit) chatSubmit.disabled = !enabled;
}

function setPending(pending) {
 setFormEnabled(ollamaReady && !pending);
}

function setStatus(online) {
 ollamaReady = online;

 if (chatStatus) {
  chatStatus.textContent =
   online ? "IA ativa (Ollama)" : "Indisponível";
  chatStatus.className = `chat-status chat-status--${online ? "online" : "error"}`;
 }

 if (chatUnavailable) {
  chatUnavailable.hidden = online;
 }

 setFormEnabled(online);
}

async function resolveReply(message) {
 if (!ollamaReady) {
  throw new ChatUnavailableError();
 }

 const reply = await askAssistant(message, chatHistory);
 chatHistory.push(
  { role: "user", content: message },
  { role: "assistant", content: reply },
 );
 return reply;
}

async function handleSubmit(event) {
 event.preventDefault();
 const message = chatInput?.value.trim();
 if (!message || !ollamaReady) return;

 chatInput.value = "";
 appendMessage("user", message);
 appendMessage("bot", "A pensar…");
 setPending(true);

 try {
  const reply = await resolveReply(message);
  replaceLastBotMessage(reply);
 } catch (error) {
  if (error instanceof ChatUnavailableError) {
   setStatus(false);
   replaceLastBotMessage(UNAVAILABLE_MESSAGE);
  } else {
   replaceLastBotMessage(
    "Não consegui responder agora. Tenta novamente em instantes.",
   );
  }
 } finally {
  setPending(false);
  if (ollamaReady) chatInput?.focus();
 }
}

async function init() {
 const user = await requireSession();
 if (!user) return;

 setFormEnabled(false);
 const online = await isChatApiAvailable();
 setStatus(online);

 appendMessage("bot", online ? WELCOME_ONLINE : UNAVAILABLE_MESSAGE);

 chatForm?.addEventListener("submit", handleSubmit);
 if (online) chatInput?.focus();
}

init();
