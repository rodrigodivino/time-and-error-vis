import { sortByBool } from "./utils.js";
function draw(data) {
  const width = window.innerWidth * 0.95;
  const height = window.innerHeight * 0.95;
  const margin = { top: 10, left: 10, right: 10, bottom: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const outerCellHeight = innerHeight / 3;
  const outerCellWidth = innerWidth / 13;
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
    .attr("transform", (_, i) => `translate(${i * outerCellWidth},0)`);

  const cell = columnContainers
    .selectAll("g.cellContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("cellContainer", true)
    .attr("transform", (_, i) => `translate(0,${i * outerCellHeight})`);

  cell
    .append("rect")
    .attr("fill", "snow")
    .attr("stroke", "slategray")
    .attr("width", outerCellWidth)
    .attr("height", outerCellHeight);

  const innerCellWidth = outerCellWidth;
  const innerCellHeight = outerCellHeight / 2;

  const correctnessCell = cell
    .append("g")
    .classed("correctnessCell", true)
    .selectAll("rect.correct")
    .data(d => d.sort(sortByBool))
    .join("rect")
    .classed("correct", true)
    .attr("x", (d, i) => {
      return Math.floor(i / 3) * (innerCellWidth / 4);
    })
    .attr("y", (d, i) => {
      return (i % 3) * (innerCellHeight / 3);
    })
    .attr("width", innerCellWidth / 4)
    .attr("height", innerCellHeight / 3)
    .attr("stroke", "black")
    .attr("fill", d => {
      if (d.correctness) return "mediumseagreen";
      else return "firebrick";
    });

  const bins = 6;
  const barWidth = innerCellWidth / bins;

  const histogramCell = cell
    .append("g")
    .classed("histogramCell", true)
    .attr("transform", `translate(0,${innerCellHeight})`)
    .each(function(data) {
      const group = data[0].group;
      const parentData = d3.select(this.parentNode.parentNode).data()[0];
      const extent = d3.extent(parentData, e => e.duration);
      const x = d3
        .scaleLinear()
        .domain(extent)
        .range([0, innerCellWidth]);

      const y = d3
        .scaleLinear()
        .domain([0, 12])
        .range([0, innerCellHeight]);

      const max = x.domain()[1];
      const min = x.domain()[0];
      const step = (max - min) / bins;
      const thresholds = d3.range(bins).map(d => min + d * step);
      const histogram = d3
        .histogram()
        .domain(x.domain())
        .thresholds(thresholds)
        .value(d => d.duration);

      const rects = d3
        .select(this)
        .selectAll("rect.histBar")
        .data(histogram(data))
        .join("rect")
        .classed("histBar", true)
        .attr("x", arr => {
          return x(arr.x0);
        })
        .attr("y", arr => {
          return innerCellHeight - y(arr.length);
        })
        .attr("width", arr => {
          return x(arr.x1) - x(arr.x0);
        })
        .attr("height", arr => {
          return y(arr.length);
        })
        .attr("fill", "steelblue")
        .attr("stroke", "black");
    });
}

export { draw };
