class ModalManager {
  create({ modalId, titleId, bodyId, closeId }) {
    const modal = document.getElementById(modalId);
    const title = document.getElementById(titleId);
    const body = document.getElementById(bodyId);
    const close = document.getElementById(closeId);
    if (!modal || !title || !body || !close) return null;

    function hide() {
      modal.classList.add("hidden");
    }

    function show({ heading, message }) {
      title.textContent = heading;
      body.textContent = message;
      modal.classList.remove("hidden");
    }

    close.addEventListener("click", hide);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) hide();
    });

    return { show, hide };
  }
}
