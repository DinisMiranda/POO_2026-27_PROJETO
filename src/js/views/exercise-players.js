import { t, tf } from "../data/i18n.js";
import { localizeActivity } from "../data/content-i18n.js";

/** Fábricas de UI personalizada por exercício (id da activity). */

function formatTime(totalSeconds) {
 const m = Math.floor(totalSeconds / 60);
 const s = totalSeconds % 60;
 return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createTimer(totalSeconds, onTick, onDone) {
 let left = totalSeconds;
 let interval = null;

 function tickEl(el) {
  if (el) el.textContent = formatTime(left);
 }

 return {
  start(el) {
   tickEl(el);
   interval = setInterval(() => {
    left -= 1;
    tickEl(el);
    onTick?.(left);
    if (left <= 0) {
     this.stop();
     onDone?.();
    }
   }, 1000);
  },
  stop() {
   if (interval) {
    clearInterval(interval);
    interval = null;
   }
  },
  get remaining() {
   return left;
  },
 };
}

function shell(activity, innerHtml) {
 const localized = localizeActivity(activity);
 return `
  <div class="player-inner player-inner--${activity.type}" data-player-id="${activity.id}">
    <p class="player-intro">${localized.description || ""}</p>
    ${innerHtml}
  </div>
`;
}

function meditationPrompts() {
 return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`exercises.player.meditation.p${n}`));
}

function bodyZones() {
 const keys = ["feet", "legs", "belly", "chest", "hands", "shoulders", "face"];
 return keys.map((key) => ({
  name: t(`exercises.player.zones.${key}.name`),
  hint: t(`exercises.player.zones.${key}.hint`),
 }));
}

function walkPrompts() {
 return [1, 2, 3, 4].map((n) => t(`exercises.player.walkP${n}`));
}

/** Respiração 4-4 — círculo animado com fases */
function breathingPlayer(activity, container, callbacks) {
 const phases = [
  { label: t("exercises.player.inhale"), class: "inhale", duration: 4 },
  { label: t("exercises.player.hold"), class: "hold", duration: 4 },
  { label: t("exercises.player.exhale"), class: "exhale", duration: 4 },
 ];
 let phaseIndex = 0;
 let phaseTimeout = null;
 let cycles = 0;
 let running = false;
 let timer = null;

 container.innerHTML = shell(
  activity,
  `
  <div class="breath-stage">
    <div class="breath-circle" id="breath-circle">
      <span id="breath-label">${t("exercises.player.prepare")}</span>
    </div>
  </div>
  <div class="player-stats">
    <span>${t("exercises.player.cycles")} <strong id="breath-cycles">0</strong></span>
    <span class="player-timer" id="breath-timer">${formatTime((activity.duration || 5) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="breath-start">${t("exercises.player.startBreath")}</button>
`,
 );

 const circle = container.querySelector("#breath-circle");
 const label = container.querySelector("#breath-label");
 const cyclesEl = container.querySelector("#breath-cycles");
 const timerEl = container.querySelector("#breath-timer");
 const startBtn = container.querySelector("#breath-start");

 timer = createTimer(
  (activity.duration || 5) * 60,
  null,
  () => {
   running = false;
   clearTimeout(phaseTimeout);
   label.textContent = t("exercises.player.sessionComplete");
   circle.className = "breath-circle";
   startBtn.textContent = t("exercises.player.repeat");
   startBtn.disabled = false;
   callbacks.onReadyToComplete?.(true);
  },
 );

 function runPhase() {
  if (!running) return;
  const phase = phases[phaseIndex];
  label.textContent = phase.label;
  circle.className = `breath-circle breath-circle--${phase.class}`;
  phaseTimeout = setTimeout(() => {
   if (phase.class === "exhale") {
    cycles += 1;
    if (cyclesEl) cyclesEl.textContent = String(cycles);
   }
   phaseIndex = (phaseIndex + 1) % phases.length;
   runPhase();
  }, phase.duration * 1000);
 }

 function start() {
  running = true;
  phaseIndex = 0;
  cycles = 0;
  if (cyclesEl) cyclesEl.textContent = "0";
  startBtn.textContent = t("common.running");
  startBtn.disabled = true;
  callbacks.onReadyToComplete?.(false);
  timer.start(timerEl);
  runPhase();
 }

 startBtn?.addEventListener("click", start);

 return {
  destroy() {
   running = false;
   clearTimeout(phaseTimeout);
   timer?.stop();
  },
 };
}

/** Meditação guiada — prompts sequenciais */
function meditationPlayer(activity, container, callbacks) {
 const prompts = meditationPrompts();

 let index = 0;
 let promptInterval = null;
 let timer = null;

 container.innerHTML = shell(
  activity,
  `
  <div class="meditation-stage">
    <div class="meditation-orb" aria-hidden="true"></div>
    <p class="meditation-prompt" id="meditation-prompt">${prompts[0]}</p>
    <div class="meditation-progress"><div class="meditation-progress-bar" id="meditation-bar"></div></div>
  </div>
  <div class="player-stats">
    <span id="meditation-step-label">${tf("exercises.player.step", { n: 1, total: prompts.length })}</span>
    <span class="player-timer" id="meditation-timer">${formatTime((activity.duration || 5) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="meditation-start">${t("exercises.player.startMeditation")}</button>
`,
 );

 const promptEl = container.querySelector("#meditation-prompt");
 const stepEl = container.querySelector("#meditation-step-label");
 const barEl = container.querySelector("#meditation-bar");
 const timerEl = container.querySelector("#meditation-timer");
 const startBtn = container.querySelector("#meditation-start");

 const total = (activity.duration || 5) * 60;
 const stepSeconds = Math.floor(total / prompts.length);

 timer = createTimer(total, (left) => {
  const done = total - left;
  const pct = Math.min(100, (done / total) * 100);
  if (barEl) barEl.style.width = `${pct}%`;
 }, () => {
  clearInterval(promptInterval);
  if (promptEl) promptEl.textContent = t("exercises.player.meditationDone");
  startBtn.textContent = t("exercises.player.repeat");
  startBtn.disabled = false;
  callbacks.onReadyToComplete?.(true);
 });

 function start() {
  index = 0;
  if (promptEl) promptEl.textContent = prompts[0];
  if (stepEl) {
   stepEl.textContent = tf("exercises.player.step", { n: 1, total: prompts.length });
  }
  if (barEl) barEl.style.width = "0%";
  startBtn.disabled = true;
  startBtn.textContent = t("common.running");
  callbacks.onReadyToComplete?.(false);

  promptInterval = setInterval(() => {
   index = Math.min(index + 1, prompts.length - 1);
   if (promptEl) promptEl.textContent = prompts[index];
   if (stepEl) {
    stepEl.textContent = tf("exercises.player.step", {
     n: index + 1,
     total: prompts.length,
    });
   }
  }, stepSeconds * 1000);

  timer.start(timerEl);
 }

 startBtn?.addEventListener("click", start);

 return {
  destroy() {
   clearInterval(promptInterval);
   timer?.stop();
  },
 };
}

/** Escaneamento corporal — percorre zonas do corpo */
function bodyScanPlayer(activity, container, callbacks) {
 const zones = bodyZones();

 let zoneIndex = 0;
 let zoneInterval = null;
 let timer = null;

 container.innerHTML = shell(
  activity,
  `
  <div class="bodyscan-stage">
    <div class="bodyscan-figure">
      ${zones
       .map(
        (z, i) =>
         `<div class="bodyscan-zone" data-zone="${i}">${z.name}</div>`,
       )
       .join("")}
    </div>
    <div class="bodyscan-active">
      <h3 id="bodyscan-name">${zones[0].name}</h3>
      <p id="bodyscan-hint">${zones[0].hint}</p>
    </div>
  </div>
  <div class="player-stats">
    <span>${t("exercises.player.zone")} <strong id="bodyscan-step">1</strong> / ${zones.length}</span>
    <span class="player-timer" id="bodyscan-timer">${formatTime((activity.duration || 10) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="bodyscan-start">${t("exercises.player.startScan")}</button>
`,
 );

 const zoneEls = container.querySelectorAll(".bodyscan-zone");
 const nameEl = container.querySelector("#bodyscan-name");
 const hintEl = container.querySelector("#bodyscan-hint");
 const stepEl = container.querySelector("#bodyscan-step");
 const timerEl = container.querySelector("#bodyscan-timer");
 const startBtn = container.querySelector("#bodyscan-start");

 const total = (activity.duration || 10) * 60;
 const zoneSeconds = Math.floor(total / zones.length);

 function highlight(i) {
  zoneEls.forEach((el, idx) => {
   el.classList.toggle("is-active", idx === i);
  });
  if (nameEl) nameEl.textContent = zones[i].name;
  if (hintEl) hintEl.textContent = zones[i].hint;
  if (stepEl) stepEl.textContent = String(i + 1);
 }

 timer = createTimer(total, null, () => {
  clearInterval(zoneInterval);
  highlight(zones.length - 1);
  startBtn.textContent = t("exercises.player.repeat");
  startBtn.disabled = false;
  callbacks.onReadyToComplete?.(true);
 });

 function start() {
  zoneIndex = 0;
  highlight(0);
  startBtn.disabled = true;
  startBtn.textContent = t("common.running");
  callbacks.onReadyToComplete?.(false);

  zoneInterval = setInterval(() => {
   zoneIndex = Math.min(zoneIndex + 1, zones.length - 1);
   highlight(zoneIndex);
  }, zoneSeconds * 1000);

  timer.start(timerEl);
 }

 startBtn?.addEventListener("click", start);

 return {
  destroy() {
   clearInterval(zoneInterval);
   timer?.stop();
  },
 };
}

/** Diário de gratidão — formulário integrado */
function gratitudePlayer(activity, container, callbacks) {
 container.innerHTML = shell(
  activity,
  `
  <form class="gratitude-form" id="gratitude-form">
    <label class="field">
      <span>${t("exercises.player.gratQ1")}</span>
      <textarea id="grat-1" rows="2" placeholder="${t("exercises.player.gratPh1")}"></textarea>
    </label>
    <label class="field">
      <span>${t("exercises.player.gratQ2")}</span>
      <textarea id="grat-2" rows="2" placeholder="${t("exercises.player.gratPh2")}"></textarea>
    </label>
    <label class="field">
      <span>${t("exercises.player.gratQ3")}</span>
      <textarea id="grat-3" rows="2" placeholder="${t("exercises.player.gratPh3")}"></textarea>
    </label>
    <label class="field">
      <span>${t("exercises.player.gratMood")}</span>
      <div class="mood-picker" id="gratitude-mood">
        ${[1, 2, 3, 4, 5]
         .map((n) => `<button type="button" class="mood-pick" data-mood="${n}">${n}</button>`)
         .join("")}
      </div>
    </label>
  </form>
  <p class="player-hint" id="gratitude-hint">${t("exercises.player.gratHint")}</p>
`,
 );

 const form = container.querySelector("#gratitude-form");
 const hint = container.querySelector("#gratitude-hint");
 const fields = [
  container.querySelector("#grat-1"),
  container.querySelector("#grat-2"),
  container.querySelector("#grat-3"),
 ];
 let selectedMood = null;

 function validate() {
  const ok =
   fields.every((f) => f?.value.trim()) && selectedMood !== null;
  callbacks.onReadyToComplete?.(ok);
  if (hint) {
   hint.textContent = ok ?
    t("exercises.player.readyToComplete")
   : t("exercises.player.gratHint");
  }
  return ok;
 }

 form?.addEventListener("input", validate);

 container.querySelector("#gratitude-mood")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".mood-pick");
  if (!btn) return;
  selectedMood = Number(btn.dataset.mood);
  container.querySelectorAll(".mood-pick").forEach((b) => {
   b.classList.toggle("is-selected", b === btn);
  });
  validate();
 });

 callbacks.onReadyToComplete?.(false);

 return {
  destroy() {},
  getJournalData() {
   return {
    entries: fields.map((f) => f?.value.trim() || ""),
    mood: selectedMood,
   };
  },
  validate,
 };
}

/** Caminhada consciente — registo de passos */
function walkPlayer(activity, container, callbacks) {
 const targetSteps = (activity.duration || 10) * 5;
 let steps = 0;

 container.innerHTML = shell(
  activity,
  `
  <div class="walk-stage">
    <div class="walk-path" id="walk-path"></div>
    <p class="walk-prompt" id="walk-prompt">${t("exercises.player.walkIntro")}</p>
    <button type="button" class="walk-step-btn" id="walk-step-btn">
      <span class="walk-step-icon">👣</span>
      <span>${t("exercises.player.registerStep")}</span>
    </button>
  </div>
  <div class="player-stats">
    <span>${t("exercises.player.steps")} <strong id="walk-count">0</strong> / ${targetSteps}</span>
    <span class="player-timer" id="walk-timer">${formatTime((activity.duration || 10) * 60)}</span>
  </div>
`,
 );

 const pathEl = container.querySelector("#walk-path");
 const countEl = container.querySelector("#walk-count");
 const promptEl = container.querySelector("#walk-prompt");
 const stepBtn = container.querySelector("#walk-step-btn");
 const timerEl = container.querySelector("#walk-timer");

 const prompts = walkPrompts();

 let promptIdx = 0;

 const timer = createTimer((activity.duration || 10) * 60, null, () => {
  stepBtn.disabled = true;
  callbacks.onReadyToComplete?.(steps >= Math.floor(targetSteps * 0.5));
  if (promptEl) promptEl.textContent = t("exercises.player.timeDone");
 });

 function addStepDot() {
  const dot = document.createElement("span");
  dot.className = "walk-dot";
  pathEl?.appendChild(dot);
 }

 stepBtn?.addEventListener("click", () => {
  steps += 1;
  if (countEl) countEl.textContent = String(steps);
  addStepDot();
  promptIdx = (promptIdx + 1) % prompts.length;
  if (promptEl) promptEl.textContent = prompts[promptIdx];

  if (steps >= targetSteps) {
   callbacks.onReadyToComplete?.(true);
   if (promptEl) promptEl.textContent = t("exercises.player.walkGoal");
  } else if (steps >= Math.floor(targetSteps * 0.5)) {
   callbacks.onReadyToComplete?.(true);
  }
 });

 timer.start(timerEl);
 callbacks.onReadyToComplete?.(false);

 return {
  destroy() {
   timer.stop();
  },
 };
}

const PLAYER_BY_ID = {
 "1": breathingPlayer,
 "2": meditationPlayer,
 "3": bodyScanPlayer,
 "4": gratitudePlayer,
 "5": walkPlayer,
};

const PLAYER_BY_TYPE = {
 respiracao: breathingPlayer,
 meditacao: meditationPlayer,
 relaxamento: bodyScanPlayer,
 diario: gratitudePlayer,
 movimento: walkPlayer,
};

export function mountExercisePlayer(activity, container, callbacks) {
 if (!container) return { destroy() {} };

 const factory =
  PLAYER_BY_ID[String(activity.id)] || PLAYER_BY_TYPE[activity.type];
 if (!factory) {
  container.innerHTML = `<p class="player-hint">${t("exercises.player.noPlayer")}</p>`;
  return { destroy() {} };
 }
 return factory(activity, container, callbacks);
}
