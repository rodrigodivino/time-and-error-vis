function cleanData(d) {
  return {
    group: d["Ambiente"],
    task: +d["Tarefa"],
    duration: d["Duracao_Tarefa"] / 1000,
    correctness: (d["Acertou_tarefa"] =
      d["Acertou_tarefa"] === "TRUE" ? true : false)
  };
}

export { cleanData };
