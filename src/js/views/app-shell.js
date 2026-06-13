import { mountZenifySidebar } from "./sidebar-view.js";
import { mountTopbar } from "./topbar-view.js";

export function mountAppShell() {
 const pageKey = document.body.dataset.zenifyPage || "";
 mountZenifySidebar(pageKey);
 mountTopbar();
}
