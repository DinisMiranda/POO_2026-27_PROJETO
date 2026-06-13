import { UserModel } from "../models/userModel.js";
import { StreakModel } from "../models/streakModel.js";

const user = UserModel.getSession();
if (!user) window.location.href = "landing.html";

// ---------- DOM refs ----------
const streakNumber = document.getElementById("streak-number");
const streakLabel = document.getElementById("streak-label");
const streakDots = document.getElementById("streak-dots");
const checkinBtn = document.getElementById("btn-checkin");
const checkinFeedback = document.getElementById("checkin-feedback");
const greetingName = document.getElementById("greeting-name");
const userAvatar = document.getElementById("user-avatar");
const userAvatarText = document.getElementById("user-avatar-text");

// ---------- Helpers ----------
function getInitials(currentUser) {
 const first = (currentUser.firstName || "").trim();
 const last = (currentUser.lastName || "").trim();

 if (first && last) {
  return `${first[0]}${last[0]}`.toUpperCase();
 }

 if (currentUser.name) {
  const parts = currentUser.name.trim().split(/\s+/);
  if (parts.length >= 2) {
   return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
 }

 return "ZU";
}

// ---------- Greeting ----------
if (greetingName && user) {
 greetingName.textContent = `Olá, ${user.firstName || "utilizador"}`;
}

const initials = getInitials(user);
if (userAvatar) userAvatar.textContent = initials;
if (userAvatarText) userAvatarText.textContent = initials;

// ---------- Streak ----------
async function loadStreak() {
 try {
  const stats = await StreakModel.syncStreak(user.id);
  renderStreak(stats);

  if (stats.broken) {
   showFeedback("A tua streak foi reiniciada. Começa hoje!", "warning");
  }
 } catch (err) {
  console.error("Erro ao carregar streak:", err);
 }
}

function renderStreak(stats) {
 if (streakNumber) streakNumber.textContent = stats.streak;

 if (streakLabel) {
  streakLabel.textContent =
   stats.streak === 1 ? "dia seguido" : "dias seguidos";
 }

 renderDots(stats.streak, stats.checkedInToday);

 if (checkinBtn) {
  if (stats.checkedInToday) {
   checkinBtn.textContent = "✓ Check-in feito hoje";
   checkinBtn.disabled = true;
   checkinBtn.classList.add("btn-checkin--done");
  } else {
   checkinBtn.textContent = "Fazer check-in de hoje";
   checkinBtn.disabled = false;
   checkinBtn.classList.remove("btn-checkin--done");
  }
 }
}

function renderDots(streak, checkedInToday) {
 if (!streakDots) return;

 const total = 7;
 streakDots.innerHTML = "";

 const filledCount = Math.min(streak, total);

 for (let i = 0; i < total; i++) {
  const dot = document.createElement("div");

  if (i < filledCount) {
   dot.className = "dot dot-filled";
   if (checkedInToday && i === filledCount - 1) {
    dot.classList.add("dot-today");
   }

   dot.innerHTML = `
        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2">
          <polyline points="2,6 5,9 10,3"></polyline>
        </svg>
      `;
  } else {
   dot.className = "dot dot-empty";
  }

  streakDots.appendChild(dot);
 }
}

function showFeedback(message, type = "success") {
 if (!checkinFeedback) return;

 checkinFeedback.textContent = message;
 checkinFeedback.className = `checkin-feedback checkin-feedback--${type} visible`;

 setTimeout(() => {
  checkinFeedback.classList.remove("visible");
 }, 3500);
}

// ---------- Check-in click ----------
checkinBtn?.addEventListener("click", async () => {
 checkinBtn.disabled = true;
 checkinBtn.textContent = "A registar…";

 try {
  const result = await StreakModel.doCheckin(user.id);

  if (result.alreadyDone) {
   showFeedback("Já fizeste check-in hoje!", "warning");
  } else {
   showFeedback(
    result.streak === 1 ?
     "Check-in feito! Streak iniciada 🔥"
    : `Check-in feito! Streak: ${result.streak} dias 🔥`,
    "success",
   );
  }

  renderStreak(result);
  UserModel.saveSession({ ...user, streak: result.streak });
 } catch (err) {
  showFeedback("Erro ao registar o check-in. Tenta novamente.", "error");
  checkinBtn.disabled = false;
  checkinBtn.textContent = "Fazer check-in de hoje";
 }
});

loadStreak();
