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
 initI18n();
 mountAppShell();
 setPageTitle("page.title.settings");
 View.setLanguageValue(getLanguage());
}

function initSettingsPage() {
 initI18n();
 mountAppShell();
 setPageTitle("page.title.settings");
 View.setLanguageValue(getLanguage());

 View.bindSave(() => {
  refreshPageLanguage(View.getSelectedLanguage() || getLanguage());
  View.showFeedback(t("settings.saved"));
 });
}

initSettingsPage();
