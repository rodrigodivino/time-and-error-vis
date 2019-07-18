import { sortByBool } from "./utils.js";
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

  const columnContainers = plot
    .selectAll("g.columnContainer")
    .data(
      [1, 3, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13].map(t =>
        data.filter(d => d.task === t)
      )
    )
    .join("g")
    .classed("lineContainer", true)
    .attr("transform", (_, i) => `translate(${i * cellWidth},0)`);

  const cell = columnContainers
    .selectAll("g.cellContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("cellContainer", true)
    .attr("transform", (_, i) => `translate(0,${i * cellHeight})`);

  cell
    .append("rect")
    .attr("fill", "snow")
    .attr("stroke", "slategray")
    .attr("width", cellWidth)
    .attr("height", cellHeight);

  const cellPad = 2;
  const halfCellWidth = cellWidth - cellPad * 2;
  const halfCellHeight = cellHeight / 2 - cellPad * 2;

  const correctnessCell = cell
    .append("g")
    .classed("correctnessCell", true)
    .selectAll("rect.correct")
    .data(d => d.sort(sortByBool))
    .join("rect")
    .classed("correct", true)
    .attr("x", (d, i) => {
      return cellPad + Math.floor(i / 3) * (halfCellWidth / 4);
    })
    .attr("y", (d, i) => {
      return cellPad + (i % 3) * (halfCellHeight / 3);
    })
    .attr("width", halfCellWidth / 4)
    .attr("height", halfCellHeight / 3)
    .attr("stroke", "black")
    .attr("fill", d => {
      if (d.correctness) return "mediumseagreen";
      else return "firebrick";
    });

  const histogramCell = cell
    .append("g")
    .classed("histogramCell", true)
    .attr("transform", `translate(0,${halfCellHeight})`)
    .each(function(d) {
      const parentData = d3.select(this.parentNode.parentNode).data();
      console.log(parentData);
    });
}

export { draw };
