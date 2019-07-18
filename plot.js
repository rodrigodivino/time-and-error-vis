function draw(data) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, left: 10, right: 10, bottom: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const cellHeight = innerHeight / 3;
  const cellWidth = innerWidth / 13;
  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height);
  const plot = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  plot
    .append("rect")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("fill", "none")
    .attr("stroke", "slategray");

  const lineContainers = plot
    .selectAll("g.lineContainer")
    .data(["A", "B", "C"].map(g => data.filter(d => d.group === g)))
    .join("g")
    .classed("lineContainer", true)
    .attr("transform", (_, i) => `translate(0,${i * cellHeight})`);

  const cell = lineContainers
    .selectAll("g.cellContainer")
    .data(gArr => d3.range(1, 14).map(t => gArr.filter(d => d.task === t)))
    .join("g")
    .classed("cellContainer", true)
    .attr("transform", (_, i) => `translate(${i * cellWidth},0)`);

  cell
    .append("rect")
    .attr("fill", "snow")
    .attr("stroke", "slategray")
    .attr("width", cellWidth)
    .attr("height", cellHeight);

  const cellPad = 2;
  const correctnessCellWidth = cellWidth - cellPad * 2;
  const correctnessCellHeight = cellHeight / 2 - cellPad * 2;

  const correctnessCell = cell
    .append("g")
    .classed("correctnessCell", true)
    .selectAll("rect.correct")
    .data(d => d)
    .join("rect")
    .classed("correct", true)
    .attr("x", (d, i) => {
      return cellPad;
    })
    .attr("y", (d, i) => {
      return cellPad;
    })
    .attr("width", correctnessCellWidth / 4)
    .attr("height", correctnessCellHeight / 3)
    .attr("stroke", "black")
    .attr("fill", "red");
}

export { draw };
