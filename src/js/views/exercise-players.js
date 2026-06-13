/** Fabricas de UI personalizada por exercicio (id da activity). */

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
 return `
  <div class="player-inner player-inner--${activity.type}" data-player-id="${activity.id}">
    <p class="player-intro">${activity.description || ""}</p>
    ${innerHtml}
  </div>
`;
}

/** Respiração 4-4 — círculo animado com fases */
function breathingPlayer(activity, container, callbacks) {
 const phases = [
  { label: "Inspira", class: "inhale", duration: 4 },
  { label: "Retém", class: "hold", duration: 4 },
  { label: "Expira", class: "exhale", duration: 4 },
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
      <span id="breath-label">Preparar</span>
    </div>
  </div>
  <div class="player-stats">
    <span>Ciclos: <strong id="breath-cycles">0</strong></span>
    <span class="player-timer" id="breath-timer">${formatTime((activity.duration || 5) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="breath-start">Começar respiração</button>
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
   label.textContent = "Sessão completa";
   circle.className = "breath-circle";
   startBtn.textContent = "Repetir";
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
  startBtn.textContent = "A decorrer…";
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
 const prompts = [
  "Fecha os olhos suavemente e endireita a coluna.",
  "Leva a atenção para a respiração natural, sem a forçar.",
  "Nota o ar a entrar e a sair pelo nariz.",
  "Se surgirem pensamentos, observa-os e deixa-os passar.",
  "Volta sempre à sensação do corpo neste momento.",
  "Expande a consciência para os sons à tua volta.",
  "Sente gratidão por este momento de pausa.",
  "Prepara-te para regressar com calma e clareza.",
 ];

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
    <span>Passo <strong id="meditation-step">1</strong> / ${prompts.length}</span>
    <span class="player-timer" id="meditation-timer">${formatTime((activity.duration || 5) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="meditation-start">Iniciar meditação</button>
`,
 );

 const promptEl = container.querySelector("#meditation-prompt");
 const stepEl = container.querySelector("#meditation-step");
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
  if (promptEl) promptEl.textContent = "Meditação concluída. Respira fundo e abre os olhos.";
  startBtn.textContent = "Repetir";
  startBtn.disabled = false;
  callbacks.onReadyToComplete?.(true);
 });

 function start() {
  index = 0;
  if (promptEl) promptEl.textContent = prompts[0];
  if (stepEl) stepEl.textContent = "1";
  if (barEl) barEl.style.width = "0%";
  startBtn.disabled = true;
  startBtn.textContent = "A decorrer…";
  callbacks.onReadyToComplete?.(false);

  promptInterval = setInterval(() => {
   index = Math.min(index + 1, prompts.length - 1);
   if (promptEl) promptEl.textContent = prompts[index];
   if (stepEl) stepEl.textContent = String(index + 1);
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
 const zones = [
  { name: "Pés", hint: "Relaxa dedos e solas. Sentir o contacto com o chão." },
  { name: "Pernas", hint: "Liberta tensão em coxas e joelhos." },
  { name: "Abdómen", hint: "Deixa o ar entrar suavemente na barriga." },
  { name: "Peito", hint: "Observa o peito a subir e descer." },
  { name: "Mãos", hint: "Abre e fecha as mãos com consciência." },
  { name: "Ombros", hint: "Deixa os ombros caírem, longe das orelhas." },
  { name: "Rosto", hint: "Suaviza testa, maxilar e língua." },
 ];

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
    <span>Zona <strong id="bodyscan-step">1</strong> / ${zones.length}</span>
    <span class="player-timer" id="bodyscan-timer">${formatTime((activity.duration || 10) * 60)}</span>
  </div>
  <button type="button" class="btn-primary" id="bodyscan-start">Iniciar escaneamento</button>
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
  startBtn.textContent = "Repetir";
  startBtn.disabled = false;
  callbacks.onReadyToComplete?.(true);
 });

 function start() {
  zoneIndex = 0;
  highlight(0);
  startBtn.disabled = true;
  startBtn.textContent = "A decorrer…";
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
      <span>1. Pelo que és grato hoje?</span>
      <textarea id="grat-1" rows="2" placeholder="Ex.: Um café calmo antes das aulas"></textarea>
    </label>
    <label class="field">
      <span>2. O que correu bem?</span>
      <textarea id="grat-2" rows="2" placeholder="Ex.: Consegui estudar sem procrastinar"></textarea>
    </label>
    <label class="field">
      <span>3. O que queres levar para amanhã?</span>
      <textarea id="grat-3" rows="2" placeholder="Ex.: Mais pausas conscientes"></textarea>
    </label>
    <label class="field">
      <span>Como te sentes agora? (1–5)</span>
      <div class="mood-picker" id="gratitude-mood">
        ${[1, 2, 3, 4, 5]
         .map((n) => `<button type="button" class="mood-pick" data-mood="${n}">${n}</button>`)
         .join("")}
      </div>
    </label>
  </form>
  <p class="player-hint" id="gratitude-hint">Preenche os 3 campos e escolhe o teu humor.</p>
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
    "Pronto! Clica em «Concluir exercício» para guardar."
   : "Preenche os 3 campos e escolhe o teu humor.";
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
    <p class="walk-prompt" id="walk-prompt">Caminha devagar. Toca em «Passo» a cada passo consciente.</p>
    <button type="button" class="walk-step-btn" id="walk-step-btn">
      <span class="walk-step-icon">👣</span>
      <span>Registar passo</span>
    </button>
  </div>
  <div class="player-stats">
    <span>Passos: <strong id="walk-count">0</strong> / ${targetSteps}</span>
    <span class="player-timer" id="walk-timer">${formatTime((activity.duration || 10) * 60)}</span>
  </div>
`,
 );

 const pathEl = container.querySelector("#walk-path");
 const countEl = container.querySelector("#walk-count");
 const promptEl = container.querySelector("#walk-prompt");
 const stepBtn = container.querySelector("#walk-step-btn");
 const timerEl = container.querySelector("#walk-timer");

 const prompts = [
  "Sente o calcanhar a tocar o chão.",
  "Rola o peso para a planta do pé.",
  "Observa o balanço natural dos braços.",
  "Mantém a respiração calma e regular.",
 ];

 let promptIdx = 0;

 const timer = createTimer((activity.duration || 10) * 60, null, () => {
  stepBtn.disabled = true;
  callbacks.onReadyToComplete?.(steps >= Math.floor(targetSteps * 0.5));
  if (promptEl) promptEl.textContent = "Tempo terminado. Podes concluir o exercício.";
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
   if (promptEl) promptEl.textContent = "Objectivo de passos alcançado! Excelente caminhada consciente.";
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
  container.innerHTML = `<p class="player-hint">Exercício sem player personalizado.</p>`;
  return { destroy() {} };
 }
 return factory(activity, container, callbacks);
}
