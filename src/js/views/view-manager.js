export function initViews({ selectorButtons, selectorViews, activeClass }) {
  const buttons = Array.from(document.querySelectorAll(selectorButtons));
  const views = Array.from(document.querySelectorAll(selectorViews));
  if (!buttons.length || !views.length) return;

  function show(targetName) {
    views.forEach((view) => {
      view.classList.toggle("hidden", view.dataset.view !== targetName);
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.viewTarget === targetName;
      button.classList.toggle(activeClass, isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      show(button.dataset.viewTarget);
    });
  });

  show(buttons[0].dataset.viewTarget);
}
