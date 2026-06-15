# Design inclusivo no Zenify

## O que significa neste projecto

1. **Contraste de cores:** texto principal em `slate-900` sobre fundos claros; botoes primarios em `indigo-700/800` (alinhado com boas praticas WCAG AA em pares comuns).
2. **Navegacao por teclado:** `:focus-visible` em todos os elementos interactivos; modais fecham com `Escape`; skip link para saltar ao `main`.
3. **Atributos ARIA:** `aria-label` em navegacao, `aria-live` em recomendacoes/chat/erros, `role="dialog"` e `aria-modal` nos modais, `aria-selected` nos botoes de views.
4. **Movimento reduzido:** `prefers-reduced-motion` desactiva animacoes longas quando o SO pede.

## Ficheiros relevantes

- `src/css/af.css` — estilos partilhados de acessibilidade
- `src/js/views/view-manager.js` — estado activo exposto a leitores de ecrã (admin)
