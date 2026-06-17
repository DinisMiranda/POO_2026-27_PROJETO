import { mountZenifySidebar } from "./sidebar-view.js";
import { mountTopbar } from "./topbar-view.js";
import { initI18n } from "../data/i18n.js";

export function mountAppShell() {
 initI18n();
 const pageKey = document.body.dataset.zenifyPage || "";
 mountZenifySidebar(pageKey);
 mountTopbar();
}
