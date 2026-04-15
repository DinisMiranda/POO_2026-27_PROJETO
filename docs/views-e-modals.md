# Views e Modals: como esta dividido

Este documento explica a organizacao da interface para ficar facil de manter.

## 1) Ideia geral

- Cada pagina principal (`app.html` e `admin.html`) foi dividida em **views**.
- Cada view e um bloco HTML com `data-view="nome-da-view"`.
- A troca entre views e feita por botoes com `data-view-target="nome-da-view"`.
- Feedback de acoes (guardar, criar, remover) aparece num **modal**.

Resultado: menos confusao no layout e menos logica repetida.

## 2) Ficheiros partilhados de UI

### `src/js/views/view-manager.js`

Este ficheiro centraliza a navegacao entre views:

- `init(...)`
  - liga botoes aos blocos de view
  - mostra a view ativa e esconde as restantes
  - aplica classe visual no botao ativo

### `src/js/modals/modal-manager.js`

Este ficheiro centraliza o comportamento de modal:

- `create(...)`
  - prepara o modal com titulo, mensagem e botao de fechar
  - devolve `show({ heading, message })`
  - permite fechar no botao ou ao clicar fora da caixa

Assim, `app.js` e `admin.js` so chamam funcoes prontas.

## 3) Divisao por pagina

### `app.html` + `src/js/app.js`

Views existentes:

- `dashboard`: diario + gamificacao + recomendacoes
- `breathing`: exercicio de calma
- `history`: historico de check-ins

Modais usados para:

- confirmar que check-in foi guardado
- confirmar fim do exercicio e ganho de XP

### `admin.html` + `src/js/admin.js`

Views existentes:

- `activities`: criar e listar atividades
- `overview`: resumo com total de atividades

Modais usados para:

- confirmar criacao de atividade
- confirmar remocao de atividade

## 4) Onde fica cada responsabilidade

- **HTML (`*.html`)**: estrutura visual e marcadores (`data-view`, ids, botoes)
- **Views (`views/view-manager.js`)**: troca entre views
- **Modals (`modals/modal-manager.js`)**: abrir/fechar modais de feedback
- **Logica de negocio (`app.js`, `admin.js`)**: dados, regras e eventos da pagina
- **Auth (`auth.js`)**: sessao, login/registo e controlo de acesso por role

## 5) Como adicionar nova view

1. Criar um botao com `data-view-target="nova-view"`.
2. Criar um bloco com `data-view="nova-view"` (inicialmente `hidden`).
3. Garantir que `view-manager.js` esta incluido e que `ZenifyViews.init(...)` corre no JS da pagina.

Nao e preciso escrever mais logica de navegacao.

## 6) Como mostrar novo modal

No JS da pagina:

```js
modal.show({
  heading: "Titulo",
  message: "Mensagem para o utilizador.",
});
```

O mesmo componente de modal serve para varios cenarios.
