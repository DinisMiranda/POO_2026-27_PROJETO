import {
 askAssistant,
 ChatUnavailableError,
 isChatApiAvailable,
} from "../data/chat-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { ChatbotView as View } from "../views/chatbot-view.js";

let chatHistory = [];
let ollamaReady = false;

const WELCOME_ONLINE =
 "Olá! Sou o assistente Zenify. Pergunta sobre ansiedade, stress, sono, hábitos de estudo ou exercícios de bem-estar.";

const UNAVAILABLE_MESSAGE =
 "O assistente com IA não está disponível. Confirma que o Ollama está a correr e que executaste `npm run chat-api` (porta 3002). Tenta novamente mais tarde.";

function setPending(pending) {
 View.setFormEnabled(ollamaReady && !pending);
}

function setStatus(online) {
 ollamaReady = online;
 View.setStatus(online);
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
 const message = View.getInputMessage();
 if (!message || !ollamaReady) return;

 View.clearInput();
 View.appendMessage("user", message);
 View.appendMessage("bot", "A pensar…");
 setPending(true);

 try {
  const reply = await resolveReply(message);
  View.replaceLastBotMessage(reply);
 } catch (error) {
  if (error instanceof ChatUnavailableError) {
   setStatus(false);
   View.replaceLastBotMessage(UNAVAILABLE_MESSAGE);
  } else {
   View.replaceLastBotMessage(
    "Não consegui responder agora. Tenta novamente em instantes.",
   );
  }
 } finally {
  setPending(false);
  if (ollamaReady) View.focusInput();
 }
}

async function init() {
 mountAppShell();
 const user = await requireSession();
 if (!user) return;

 View.setFormEnabled(false);
 const online = await isChatApiAvailable();
 setStatus(online);

 View.appendMessage("bot", online ? WELCOME_ONLINE : UNAVAILABLE_MESSAGE);
 View.bindSubmit(handleSubmit);

 if (online) View.focusInput();
}

init();
