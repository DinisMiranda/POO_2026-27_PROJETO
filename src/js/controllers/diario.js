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
import { setPageTitle, t } from "../data/i18n.js";

let activeUser = null;
let journalEntries = [];
let chatHistory = [];
let ollamaReady = false;

async function refreshJournal() {
 journalEntries = await fetchJournalEntries(activeUser.id);
 View.renderJournalLog(journalEntries);
}

async function handleJournalSubmit(event) {
 event.preventDefault();
 if (!activeUser) return;

 const { title, body } = View.getFormData();
 if (!title || !body) {
  View.showFeedback(t("diary.fillRequired"), "error");
  return;
 }

 View.setSubmitDisabled(true);
 View.clearFeedback();

 try {
  await saveJournalEntry(activeUser.id, { title, body });
  View.resetForm();
  View.showFeedback(t("diary.saved"));
  await refreshJournal();
 } catch {
  View.showFeedback(t("diary.saveFailed"), "error");
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
 ChatView.appendMessage("bot", t("diary.thinking"));
 setChatPending(true);

 try {
  const reply = await resolveChatReply(message);
  ChatView.replaceLastBotMessage(reply);
 } catch (error) {
  if (error instanceof ChatUnavailableError) {
   setChatStatus(false);
   ChatView.replaceLastBotMessage(t("diary.offline"));
  } else {
   ChatView.replaceLastBotMessage(t("diary.chatError"));
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
 ChatView.appendMessage("bot", online ? t("diary.welcome") : t("diary.offline"));
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
 setPageTitle("page.title.journal");
 activeUser = await requireSession();
 if (!activeUser) return;

 bindEvents();
 await Promise.all([refreshJournal(), initChat()]);
}

init();
