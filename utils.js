function cleanData(d) {
  return {
    group: d["Ambiente"],
    task: +d["Tarefa"],
    duration: d["Duracao_Tarefa"] / 1000,
    correctness: (d["Acertou_tarefa"] =
      d["Acertou_tarefa"] === "TRUE" ? true : false)
  };
}

function sortByBool(a, b) {
  const x = a.correctness;
  const y = b.correctness;
  // true values first
  return x === y ? 0 : x ? 1 : -1;
  // false values first
  // return (x === y)? 0 : x? 1 : -1;
}

export { cleanData, sortByBool };
