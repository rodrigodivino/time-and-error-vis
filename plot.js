/* global d3 */
import { getCI } from "./utils.js";
function draw(data) {
  const width = 400;
  const height = 1400;
  const margin = { top: 40, left: 40, right: 10, bottom: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height);
  const plot = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const rootContainerPad = 30;
  const rootContainerWidth = innerWidth;
  const rootContainerHeight = innerHeight / 13 - rootContainerPad;
  const rootContainers = plot
    .selectAll("g.rootContainer")
    .data(
      [1, 3, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13].map(t =>
        data.filter(d => d.task === t)
      )
    )
    .join("g")
    .classed("rootContainer", true)
    .attr(
      "transform",
      (_, i) => `translate(0,${i * (rootContainerHeight + rootContainerPad)})`
    );

  const timeContainerWidth = 0.5 * rootContainerWidth - rootContainerPad / 2;
  const timeContainerHeight = rootContainerHeight;
  const timeContainers = rootContainers
    .append("g")
    .classed("timeContainers", true);

  const accuracyContainerWidth =
    0.5 * rootContainerWidth - rootContainerPad / 2;
  const accuracyContainerHeight = rootContainerHeight;
  const accuracyContainers = rootContainers
    .append("g")
    .attr(
      "transform",
      `translate(${0.5 * rootContainerWidth + rootContainerPad / 2},0)`
    );

  rootContainers
    .append("rect")
    .attr("width", rootContainerWidth)
    .attr("height", rootContainerHeight)
    .attr("fill", "none")
    .attr("stroke", "black");

  rootContainers
    .append("text")
    .attr("x", -margin.left / 3)
    .attr("y", rootContainerHeight / 2)
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "end")
    .text(arr => "T" + arr[0].task);

  timeContainers
    .append("rect")
    .attr("width", accuracyContainerWidth)
    .attr("height", accuracyContainerHeight)
    .attr("fill", "steelblue")
    .attr("fill-opacity", 0.2);

  accuracyContainers
    .append("rect")
    .attr("width", timeContainerWidth)
    .attr("height", timeContainerHeight)
    .attr("fill", "firebrick")
    .attr("fill-opacity", 0.2);

  svg
    .append("text")
    .attr("x", margin.left + timeContainerWidth / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .text("Time (seconds)");

  const timeEnvContainerWidth = timeContainerWidth;
  const timeEnvContainerHeight = timeContainerHeight / 3;

  const timeEnvContainers = timeContainers
    .selectAll("g.timeEnvContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("timeEnvContainer", "true")
    .attr("transform", (_, i) => `translate(0,${i * timeEnvContainerHeight})`)
    .attr("mean", data => {
      return d3.mean(data.map(d => d.duration));
    })
    .attr("fill", (_, i) => d3.schemeCategory10[i])
    .attr("stroke", (_, i) => d3.schemeCategory10[i])
    .attr("group", d => {
      return d[0]["group"];
    });

  timeEnvContainers
    .append("rect")
    .attr("width", timeEnvContainerWidth)
    .attr("height", timeEnvContainerHeight)
    .attr("fill", "white")
    .attr("stroke", "black");

  timeEnvContainers.each(function(data) {
    const dataArr = data.map(d => d.duration);
    const means = [];
    d3.select(this.parentNode)
      .selectAll("g.timeEnvContainer")
      .each(function() {
        means.push(parseFloat(d3.select(this).attr("mean")));
      });
    const ext = d3.extent(means);

    const meanRadius = timeEnvContainerHeight / 2;
    const x = d3
      .scaleLinear()
      .domain(ext)
      .range([meanRadius, timeEnvContainerWidth - meanRadius]);

    d3.select(this)
      .selectAll("rect.ci")
      .data([dataArr])
      .join("rect")
      .each(function(arr) {
        const rect = d3.select(this);
        const [ciLow, ciHigh] = getCI(arr);
        const xPos = x(ciLow) < 0 ? 0 : x(ciLow);
        const width =
          x(ciHigh) > timeEnvContainerWidth
            ? timeEnvContainerWidth - xPos
            : x(ciHigh) - xPos;

        rect
          .attr("x", xPos)
          .attr("width", width)
          .attr("height", timeEnvContainerHeight)
          .attr("fill-opacity", 0.8)
          .attr("stroke", "none");
      });

    d3.select(this)
      .selectAll("circle.mean")
      .data([dataArr])
      .join("circle")
      .attr("fill-opacity", 1)
      .classed("mean", true)
      .attr("r", meanRadius)
      .attr("cx", d => x(d3.mean(d)))
      .attr("cy", timeEnvContainerHeight / 2)
      .attr("stroke", "black");

    d3.select(this)
      .selectAll("text.mean")
      .data([dataArr])
      .join("text")
      .classed("mean", true)
      .attr("x", d => x(d3.mean(d)))
      .attr("y", timeEnvContainerHeight / 2 + 1.5)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("font-weight", "bolder")
      .attr("font-family", "monospace")
      .attr("font-size", "180%")
      .text(function() {
        return d3.select(this.parentNode).attr("group");
      });
  });
  timeContainers.each(function() {
    const means = [];
    d3.select(this)
      .selectAll("g.timeEnvContainer")
      .each(function() {
        means.push(parseFloat(d3.select(this).attr("mean")));
      });

    const meanRadius = timeEnvContainerHeight / 2;
    const tickAmount = 4;
    const tickStep = (d3.max(means) - d3.min(means)) / tickAmount;
    const tickValues = new Array(tickAmount + 1)
      .fill(0)
      .map((d, i) => d3.min(means) + i * tickStep);

    d3.select(this)
      .append("g")
      .attr("transform", `translate(0,-2)`)
      .classed("x-axis", true)
      .call(
        d3
          .axisTop(
            d3
              .scaleLinear()
              .domain(d3.extent(means))
              .range([meanRadius, timeEnvContainerWidth - meanRadius])
          )
          .tickValues(tickValues)
      );
  });
}

export { draw };
