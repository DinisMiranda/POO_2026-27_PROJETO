import { askAssistant, isChatApiAvailable } from "../data/chat-service.js";
import { respondToChat } from "../models/chatbot.js";
import { requireSession } from "../data/session.js";

const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSubmit = document.getElementById("chat-submit");
const chatStatus = document.getElementById("chat-status");

let chatHistory = [];
let ollamaReady = false;

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

function setPending(pending) {
 if (chatInput) chatInput.disabled = pending;
 if (chatSubmit) chatSubmit.disabled = pending;
}

function setStatus(online) {
 if (!chatStatus) return;

 ollamaReady = online;
 chatStatus.textContent =
  online ? "Modo IA (Ollama) ativo" : "Modo offline — respostas pré-definidas";
 chatStatus.className = `chat-status chat-status--${online ? "online" : "offline"}`;
}

async function resolveReply(message) {
 if (ollamaReady) {
  try {
   const reply = await askAssistant(message, chatHistory);
   chatHistory.push(
    { role: "user", content: message },
    { role: "assistant", content: reply },
   );
   return reply;
  } catch {
   setStatus(false);
  }
 }

 return respondToChat(message);
}

async function handleSubmit(event) {
 event.preventDefault();
 const message = chatInput?.value.trim();
 if (!message) return;

 chatInput.value = "";
 appendMessage("user", message);
 appendMessage("bot", "A pensar…");
 setPending(true);

 try {
  const reply = await resolveReply(message);
  replaceLastBotMessage(reply);
 } catch {
  replaceLastBotMessage("Não consegui responder agora. Tenta outra vez.");
 } finally {
  setPending(false);
  chatInput?.focus();
 }
}

async function init() {
 const user = await requireSession();
 if (!user) return;

 setPending(true);
 const online = await isChatApiAvailable();
 setStatus(online);
 setPending(false);

 appendMessage(
  "bot",
  online ?
   "Olá! Sou o assistente Zenify. Pergunta sobre ansiedade, stress, sono ou exercícios."
  : "Olá! O Ollama não está disponível. Respondo com sugestões pré-definidas — tenta: ansiedade, stress, humor ou exercício.",
 );

 chatForm?.addEventListener("submit", handleSubmit);
 chatInput?.focus();
}

init();
