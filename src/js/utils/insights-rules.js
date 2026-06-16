export function buildInsightsRecommendations(avgMood, streak) {
 if (avgMood < 3.2) {
  return [
   {
    title: "Reforçar regulação emocional",
    text:
     "Experimenta respiração box e diário de gratidão nos dias de humor mais baixo.",
   },
   {
    title: "Rotina pós-estudo",
    text: "Cria um fecho de dia com meditação curta e menos tempo de ecrã.",
   },
  ];
 }

 if (streak >= 7) {
  return [
   {
    title: "Mantém a consistência",
    text: "Estás num bom ritmo. Continua com micro check-ins diários.",
   },
   {
    title: "Sobe a dificuldade",
    text:
     "Adiciona uma sessão de movimento consciente para diversificar hábitos.",
   },
  ];
 }

 return [
  {
   title: "Criar hábito diário",
   text: "Faz pelo menos um check-in por dia para ganhar consistência.",
  },
  {
   title: "Explorar exercícios",
   text:
    "Testa respiração, meditação e diário para perceber o que funciona melhor contigo.",
  },
 ];
}
