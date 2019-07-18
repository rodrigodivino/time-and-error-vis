function draw(data) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, left: 10, right: 10, bottom: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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
    .data(["A", "B", "C"])
    .join("g")
    .classed("lineContainer", true)
    .attr("transform", (_, i) => `translate(0,${(i * innerHeight) / 3})`);

  const columnContainers = lineContainers.selectAll("g.columnContainer");
}

export { draw };
