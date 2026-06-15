const TOKEN_KEY = "zenify_token";

export function getAuthToken() {
 return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
 if (token) sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
 sessionStorage.removeItem(TOKEN_KEY);
}

export function parseAuthToken(token) {
 if (!token) return null;

 try {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));
  return {
   id: payload.sub,
   email: payload.email,
  };
 } catch {
  return null;
 }
}
