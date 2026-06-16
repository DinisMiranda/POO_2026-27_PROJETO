export const ChatbotView = {
 chatLog: document.getElementById("chat-log"),
 chatForm: document.getElementById("chat-form"),
 chatInput: document.getElementById("chat-input"),
 chatSubmit: document.getElementById("chat-submit"),
 chatStatus: document.getElementById("chat-status"),
 chatUnavailable: document.getElementById("chat-unavailable"),

 appendMessage(author, text) {
  if (!this.chatLog) return;

  const el = document.createElement("div");
  el.className = `chat-bubble chat-bubble--${author}`;

  const label = document.createElement("span");
  label.className = "chat-bubble-author";
  label.textContent = author === "user" ? "Tu" : "Zenify";

  const body = document.createElement("p");
  body.textContent = text;

  el.append(label, body);
  this.chatLog.appendChild(el);
  this.chatLog.scrollTop = this.chatLog.scrollHeight;
 },

 replaceLastBotMessage(text) {
  if (!this.chatLog) return;

  const bubbles = this.chatLog.querySelectorAll(".chat-bubble--bot");
  const last = bubbles[bubbles.length - 1];
  const body = last?.querySelector("p");
  if (body) body.textContent = text;
  this.chatLog.scrollTop = this.chatLog.scrollHeight;
 },

 setFormEnabled(enabled) {
  if (this.chatInput) this.chatInput.disabled = !enabled;
  if (this.chatSubmit) this.chatSubmit.disabled = !enabled;
 },

 setStatus(online) {
  if (this.chatStatus) {
   this.chatStatus.textContent = online ? "IA ativa (Ollama)" : "Indisponível";
   this.chatStatus.className = `chat-status chat-status--${online ? "online" : "error"}`;
  }

  if (this.chatUnavailable) {
   this.chatUnavailable.hidden = online;
  }

  this.setFormEnabled(online);
 },

 clearInput() {
  if (this.chatInput) this.chatInput.value = "";
 },

 getInputMessage() {
  return this.chatInput?.value.trim() || "";
 },

 focusInput() {
  this.chatInput?.focus();
 },

 bindSubmit(handler) {
  this.chatForm?.addEventListener("submit", handler);
 },
};
