# Nicho e MVP do Zenify

Documento de referencia para posicionamento do projeto e planeamento de implementacao.

## 1) Proposta de valor (1 frase)

O Zenify ajuda estudantes universitarios a reduzir ansiedade academica com intervencoes rapidas, personalizadas e gamificadas, antes que o stress escale.

## 2) 3 features diferenciadoras (com user stories)

### Feature A - Intervencoes de 1-2 minutos para crise academica

**Ideia:** exercicios muito curtos para momentos reais (antes de exame, apresentacao, oral, entrega).

**User stories:**

- Como estudante em stress antes de um exame, quero iniciar um protocolo de 90 segundos para acalmar rapidamente.
- Como estudante com pouco tempo, quero tecnicas curtas para usar entre aulas sem perder foco.
- Como utilizador, quero ver no fim do exercicio se o meu estado melhorou para perceber impacto imediato.

### Feature B - Modo preventivo por contexto academico

**Ideia:** a app sugere acoes em momentos de risco (horarios criticos, epoca de testes, padroes historicos de humor).

**User stories:**

- Como estudante, quero receber um check-in preventivo antes dos meus periodos de maior ansiedade.
- Como utilizador, quero que as sugestoes mudem conforme o dia/hora e o meu historico emocional.
- Como utilizador, quero evitar chegar ao pico de ansiedade com recomendacoes proativas.

### Feature C - Gamificacao de progresso com utilidade real

**Ideia:** progressao com missoes, streak e niveis de consistencia ligados a habitos de autocuidado.

**User stories:**

- Como utilizador, quero ganhar XP por check-ins e exercicios para manter motivacao diaria.
- Como utilizador, quero completar missoes semanais para criar rotina de bem-estar.
- Como utilizador, quero visualizar evolucao de humor e consistencia para reconhecer progresso.

## 3) MVP fechado (entra / fica fora)

### Entra no MVP (versao de projeto)

- Registo/login com perfis `user` e `admin` (admin pre-definido).
- Diario de humor diario (1-5 + nota).
- Intervencao rapida de respiracao (1-2 minutos).
- Recomendacao simples por estado emocional e contexto basico (hora/dia).
- Dashboard com XP, streak, badge e historico recente.
- Painel admin para gerir atividades (CRUD base local).

### Fica fora do MVP (futuro)

- Integracao com sensores/Apple Watch.
- Comunidade social em tempo real (chat/grupos).
- Ligacao com terapeutas.
- Machine learning avancado para predicao.
- Conteudo premium/paywall.

## 4) Mapa de classes MVC (alinhado com a implementacao atual)

## Models (`src/js/models`)

- `AuthModel`
  - `getSession()`, `setSession()`, `clearSession()`
  - `registerUser()`, `loginUser()`, `requireAuth()`
- `AppModel`
  - `getCheckIns()`, `getStats()`, `addCheckIn()`, `addBreathingReward()`, `computeBadge()`
- `AdminModel`
  - `getActivities()`, `addActivity()`, `removeActivity()`

## Views (`src/js/views`)

- `AuthView`
  - bind de formularios (`bindLoginSubmit`, `bindRegisterSubmit`)
  - render de erro (`showError`, `hideError`)
- `AppView`
  - render dashboard e historico
  - bind de eventos (`bindMoodSubmit`, `bindBreathingStart`, `bindLogout`)
- `AdminView`
  - render de atividades
  - bind de eventos (`bindCreate`, `bindRemove`, `bindLogout`)
- `ZenifyViews` (view manager)
  - troca entre views por `data-view`
- `ZenifyModals` (modal manager)
  - feedback de acoes com modal reutilizavel

## Controllers (`src/js/controllers`)

- `login-controller`
  - valida sessao existente, processa login, redireciona por role
- `register-controller`
  - processa registo, cria sessao de user, redireciona para app
- `app-controller`
  - orquestra diario, recomendacoes, respiracao, gamificacao e modal
- `admin-controller`
  - orquestra criacao/remocao de atividades e feedback admin

## 5) Escopo recomendado para apresentacao

- Mostrar benchmark rapido das apps conhecidas.
- Explicar o nicho: ansiedade academica em estudantes.
- Demonstrar 1 fluxo completo:
  - login -> check-in -> intervencao rapida -> progresso atualizado.
- Fechar com roadmap de evolucao (preventivo avancado + social + sensores).
