import {
 fetchJournalEntries,
 saveJournalEntry,
} from "../data/journal-service.js";
import {
 askAssistant,
 ChatUnavailableError,
 isChatApiAvailable,
} from "../data/chat-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { DiarioView as View } from "../views/diario-view.js";
import { ChatbotView as ChatView } from "../views/chatbot-view.js";

let activeUser = null;
let journalEntries = [];
let chatHistory = [];
let ollamaReady = false;

const WELCOME_ONLINE =
 "Olá! Sou o assistente Zenify. Pergunta sobre ansiedade, stress, sono ou hábitos de estudo.";

const UNAVAILABLE_MESSAGE =
 "O assistente não está disponível. Confirma que o Ollama e o `npm run chat-api` estão ativos.";

async function refreshJournal() {
 journalEntries = await fetchJournalEntries(activeUser.id);
 View.renderJournalLog(journalEntries);
}

async function handleJournalSubmit(event) {
 event.preventDefault();
 if (!activeUser) return;

 const { title, body } = View.getFormData();
 if (!title || !body) {
  View.showFeedback("Preenche o título e o texto do registo.", "error");
  return;
 }

 View.setSubmitDisabled(true);
 View.clearFeedback();

 try {
  await saveJournalEntry(activeUser.id, { title, body });
  View.resetForm();
  View.showFeedback("Registo guardado no diário.");
  await refreshJournal();
 } catch {
  View.showFeedback(
   "Não foi possível guardar. Verifica se o json-server está ativo.",
   "error",
  );
 } finally {
  View.setSubmitDisabled(false);
 }
}

function openEntry(entryId) {
 const entry = journalEntries.find((item) => String(item.id) === String(entryId));
 if (entry) View.openJournalModal(entry);
}

function setChatPending(pending) {
 ChatView.setFormEnabled(ollamaReady && !pending);
}

function setChatStatus(online) {
 ollamaReady = online;
 ChatView.setStatus(online);
}

async function resolveChatReply(message) {
 if (!ollamaReady) throw new ChatUnavailableError();

 const reply = await askAssistant(message, chatHistory);
 chatHistory.push(
  { role: "user", content: message },
  { role: "assistant", content: reply },
 );
 return reply;
}

async function handleChatSubmit(event) {
 event.preventDefault();
 const message = ChatView.getInputMessage();
 if (!message || !ollamaReady) return;

 ChatView.clearInput();
 ChatView.appendMessage("user", message);
 ChatView.appendMessage("bot", "A pensar…");
 setChatPending(true);

 try {
  const reply = await resolveChatReply(message);
  ChatView.replaceLastBotMessage(reply);
 } catch (error) {
  if (error instanceof ChatUnavailableError) {
   setChatStatus(false);
   ChatView.replaceLastBotMessage(UNAVAILABLE_MESSAGE);
  } else {
   ChatView.replaceLastBotMessage(
    "Não consegui responder agora. Tenta novamente em instantes.",
   );
  }
 } finally {
  setChatPending(false);
  if (ollamaReady) ChatView.focusInput();
 }
}

async function initChat() {
 ChatView.setFormEnabled(false);
 const online = await isChatApiAvailable();
 setChatStatus(online);
 ChatView.appendMessage("bot", online ? WELCOME_ONLINE : UNAVAILABLE_MESSAGE);
 ChatView.bindSubmit(handleChatSubmit);
 if (online) ChatView.focusInput();
}

function bindEvents() {
 View.bindJournalForm(handleJournalSubmit);
 View.bindJournalLog(openEntry);
 View.bindModalClose(() => View.closeJournalModal());

 document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") View.closeJournalModal();
 });
}

async function init() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 bindEvents();
 await Promise.all([refreshJournal(), initChat()]);
}

init();
