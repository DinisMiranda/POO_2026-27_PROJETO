# Design inclusivo no Zenify

## O que significa neste projecto

1. **Contraste de cores:** texto principal (`--color-text`) sobre fundos claros (`--color-bg`, `--color-surface`); botões primários em verde sage (`--color-primary`).
2. **Navegação por teclado:** `:focus-visible` em elementos interactivos (`src/css/af.css`); modais fecham com `Escape`; skip link para saltar ao `main`.
3. **Atributos ARIA:** `aria-label` na navegação, `aria-live` em recomendações/chat/erros, `role="dialog"` e `aria-modal` nos modais, `aria-selected` nos botões de views (admin).
4. **Movimento reduzido:** `prefers-reduced-motion` em `af.css` desactiva animações longas quando o SO pede.

## Ficheiros relevantes

- `src/css/af.css` — skip link, foco visível e movimento reduzido
- `src/css/app.css` — tokens de cor e modais acessíveis
- `src/js/views/view-manager.js` — estado activo exposto a leitores de ecrã (admin)
