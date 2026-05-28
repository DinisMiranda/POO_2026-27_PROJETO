export function createModal({ modalId, titleId, bodyId, closeId }) {
  const modal = document.getElementById(modalId);
  const title = document.getElementById(titleId);
  const body = document.getElementById(bodyId);
  const close = document.getElementById(closeId);
  if (!modal || !title || !body || !close) return null;

  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", titleId);

  function hide() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function show({ heading, message }) {
    title.textContent = heading;
    body.textContent = message;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    close.focus();
  }

  close.addEventListener("click", hide);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) hide();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) hide();
  });

  return { show, hide };
}
