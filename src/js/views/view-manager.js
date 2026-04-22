class ViewManager {
  init({ selectorButtons, selectorViews, activeClass }) {
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
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        show(button.dataset.viewTarget);
      });
    });

    show(buttons[0].dataset.viewTarget);
  }
}
