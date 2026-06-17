import {
 getLanguage,
 initI18n,
 setLanguage,
 setPageTitle,
 t,
} from "../data/i18n.js";
import { mountAppShell } from "../views/app-shell.js";
import { SettingsView as View } from "../views/settings-view.js";

function refreshPageLanguage(language) {
 setLanguage(language);
 window.location.reload();
}

function initSettingsPage() {
 mountAppShell();
 setPageTitle("page.title.settings");
 View.setLanguageValue(getLanguage());

 View.bindSave(() => {
  const next = View.getSelectedLanguage() || getLanguage();
  if (next === getLanguage()) {
   View.showFeedback(t("settings.saved"));
   return;
  }
  refreshPageLanguage(next);
 });
}

initSettingsPage();
