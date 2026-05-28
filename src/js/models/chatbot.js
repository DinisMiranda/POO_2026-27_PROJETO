export function respondToChat(input) {
  const text = input.toLowerCase().trim();
  if (!text) {
    return "Escreve uma mensagem. Posso ajudar com ansiedade, stress, exercicios ou humor.";
  }

  if (text.includes("ansiedade") || text.includes("ansioso") || text.includes("nervoso")) {
    return "Para ansiedade: experimenta a respiracao 4-4 na aba Exercicio de calma e regista o humor no diario.";
  }

  if (text.includes("stress") || text.includes("estresse") || text.includes("sobrecarregado")) {
    return "Stress alto: faz uma pausa de 5 minutos, bebe agua e regista como te sentes (1-5) no check-in.";
  }

  if (text.includes("exame") || text.includes("teste") || text.includes("apresentacao")) {
    return "Antes de avaliacoes: usa o exercicio de calma (20s) e uma nota curta no diario para libertar tensao.";
  }

  if (text.includes("humor") || text.includes("check-in") || text.includes("diario")) {
    return "O diario de humor (1-5) atualiza XP e activa recomendacoes por regras conforme o teu estado.";
  }

  if (text.includes("exercicio") || text.includes("respiracao") || text.includes("respira")) {
    return "Na aba Exercicio de calma tens respiracao guiada. Ao concluir ganhas +5 XP.";
  }

  if (text.includes("ola") || text.includes("oi") || text.includes("bom dia") || text.includes("boa tarde")) {
    return "Ola! Sou o assistente Zenify (regras fixas). Pergunta sobre ansiedade, stress, humor ou exercicios.";
  }

  if (text.includes("ajuda") || text.includes("help")) {
    return "Palavras-chave: ansiedade, stress, exame, humor, exercicio. Respondo com sugestoes pre-definidas.";
  }

  return "Nao reconheci o tema. Tenta: ansiedade, stress, exame, humor ou exercicio.";
}
