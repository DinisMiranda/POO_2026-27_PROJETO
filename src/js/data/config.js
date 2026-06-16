const HOST =
 typeof window !== "undefined" && window.location?.hostname ?
  window.location.hostname === "127.0.0.1" ? "localhost" : window.location.hostname
 : "localhost";

export const API = `http://${HOST}:3000`;
export const CHAT_API = `http://${HOST}:3002`;
