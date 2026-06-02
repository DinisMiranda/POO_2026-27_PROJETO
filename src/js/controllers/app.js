import { requireAuth, clearSession } from "../data/auth-service.js";
import { redirectToLogin } from "../data/navigation.js";
import { addCheckin, getCheckins, getStats, saveStats } from "../data/app-service.js";
import { UserProgress } from "../models/UserProgress.js";
import { respondToChat } from "../models/chatbot.js";
import {
  appendChatMessage,
  bindBreathingStart,
  bindChatSubmit,
  bindLogout,
  bindMoodSubmit,
  renderDashboard,
  renderUser,
  resetMoodForm,
  setBreathingState,
  setRecommendation,
} from "../views/app-view.js";
import { initViews } from "../views/view-manager.js";
import { createModal } from "../views/modal-manager.js";

async function startApp(session) {
  const modal = createModal({
    modalId: "feedbackModal",
    titleId: "modalTitle",
    bodyId: "modalBody",
    closeId: "modalCloseBtn",
  });

  initViews({
    selectorButtons: "[data-view-target]",
    selectorViews: "[data-view]",
    activeClass: "bg-indigo-600",
  });

  renderUser(session);

  async function refreshDashboard() {
    const checkIns = await getCheckins();
    const stats = await getStats();
    const progress = UserProgress.fromJSON(stats);
    renderDashboard({ checkIns, progress });
    return progress;
  }

  let progress = await refreshDashboard();

  bindLogout(() => {
    clearSession();
    redirectToLogin();
  });

  bindMoodSubmit(async ({ level, note }) => {
    const today = new Date().toISOString().split("T")[0];
    await addCheckin({ date: today, level, note });
    const recommendation = progress.applyCheckInReward({ level, today });
    await saveStats(progress.toJSON());
    progress = await refreshDashboard();

    setRecommendation(recommendation);
    resetMoodForm();

    modal?.show({
      heading: "Check-in guardado",
      message: "O teu registo foi guardado e a gamificacao foi atualizada.",
    });
  });

  bindBreathingStart(() => {
    setBreathingState({
      running: true,
      status: "Inspira por 4s... expira por 4s... repete.",
    });

    setTimeout(async () => {
      progress.applyBreathingReward();
      await saveStats(progress.toJSON());
      progress = await refreshDashboard();
      setBreathingState({
        running: false,
        status: "Sessao concluida. Ganhaste +5 XP de consistencia!",
      });

      modal?.show({
        heading: "Exercicio concluido",
        message: "Boa! Recebeste +5 XP por completares a sessao de respiracao.",
      });
    }, 20000);
  });

  bindChatSubmit((message) => {
    appendChatMessage({ author: "user", text: message });
    appendChatMessage({ author: "bot", text: respondToChat(message) });
  });
}

const session = requireAuth("user");
if (session) startApp(session);
