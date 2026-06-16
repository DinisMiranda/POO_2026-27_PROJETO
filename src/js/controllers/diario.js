import { getRecommendation } from "../utils/recommendation.js";
import { ProgressService } from "../data/progress-service.js";
import {
 fetchMoodLogs,
 saveCheckinRecord,
 saveMoodLog,
} from "../data/mood-service.js";
import { requireSession } from "../data/session.js";
import { mountAppShell } from "../views/app-shell.js";
import { DiarioView as View } from "../views/diario-view.js";

let activeUser = null;
let selectedMood = null;

async function refresh() {
 const logs = await fetchMoodLogs(activeUser.id);
 View.renderHistory(logs);

 const todayMood = View.prefillToday(logs);
 if (todayMood != null) {
  selectedMood = todayMood;
  View.setRecommendation(getRecommendation(selectedMood));
 }
}

async function handleSubmit(event) {
 event.preventDefault();
 if (!activeUser || selectedMood == null) return;

 const note = View.getNote();
 View.setSubmitDisabled(true);
 View.clearFeedback();

 try {
  const isNewToday = await saveMoodLog(activeUser.id, selectedMood, note);

  if (isNewToday) {
   await saveCheckinRecord(activeUser.id, selectedMood, note);
   const checkin = await ProgressService.doCheckin(activeUser.id);
   if (!checkin.alreadyDone) {
    await Promise.all([
     ProgressService.syncChallenges(activeUser.id),
     ProgressService.syncMedals(activeUser.id),
    ]);
   }
   View.showFeedback(`Registo guardado! Streak: ${checkin.streak} dias.`);
  } else {
   View.showFeedback("Registo de hoje atualizado.");
  }

  View.setRecommendation(getRecommendation(selectedMood));
  await refresh();
 } catch {
  View.showFeedback(
   "Não foi possível guardar. Verifica se o json-server está ativo.",
   "error",
  );
 } finally {
  View.setSubmitDisabled(selectedMood == null);
 }
}

function bindMoodPicker() {
 View.moodPicker?.addEventListener("click", (event) => {
  const btn = event.target.closest(".mood-pick");
  if (!btn) return;

  selectedMood = Number(btn.dataset.mood);
  View.selectMood(selectedMood);
  View.setRecommendation(getRecommendation(selectedMood));
 });
}

async function init() {
 mountAppShell();
 activeUser = await requireSession();
 if (!activeUser) return;

 bindMoodPicker();
 View.moodForm?.addEventListener("submit", handleSubmit);
 await refresh();
}

init();
