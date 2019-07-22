/* global d3 */
import { getCI } from "./utils.js";
function draw(data) {
  const width = 400;
  const height = 1400;
  const margin = { top: 10, left: 10, right: 10, bottom: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height);
  const plot = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const rootContainerPad = 15;
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
      .attr("y", timeEnvContainerHeight / 2 + 1.2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("font-weight", "bolder")
      .attr("font-family", "sans-seriff")
      .text(function() {
        return d3.select(this.parentNode).attr("group");
      });
  });
  /*const violinPlotVerticalSpace = 0.8 * innerHeight;
  const tribellVerticalSpace = 0.2 * innerHeight;

  const violinPlots = rootContainers
    .selectAll("g.violinPlotContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("violinPlotContainer", true)
    .attr(
      "transform",
      (_, i) => `translate(0,${i * (violinPlotVerticalSpace / 3)})`
    )
    .attr("fill", (_, i) => d3.schemeCategory10[i])
    .attr("stroke", (_, i) => d3.schemeCategory10[i]);

  const tribells = rootContainers
    .selectAll("g.tribellContainer")
    .data(d => [d])
    .join("g")
    .classed("tribellContainer", true)
    .attr("transform", `translate(0,${violinPlotVerticalSpace})`);

  const bins = 12;
  violinPlots.each(function(data) {
    const parentData = d3.select(this.parentNode).data()[0];

    const extent = d3.extent(parentData, e => e.duration);
    const x = d3
      .scaleLinear()
      .domain(extent)
      .range([0, rootContainerWidth + rootContainerPad + 2]);

    const y = d3
      .scaleLinear()
      .domain([0, 12])
      .range([violinPlotVerticalSpace / 6, 0]);

    const reverseY = d3
      .scaleLinear()
      .domain([0, 12])
      .range([violinPlotVerticalSpace / 6, violinPlotVerticalSpace / 3]);

    const max = x.domain()[1];
    const min = x.domain()[0];
    const step = (max - min) / bins;
    const thresholds = d3.range(bins).map(d => min + d * step);
    const histogram = d3
      .histogram()
      .domain(x.domain())
      .thresholds(thresholds)
      .value(d => d.duration);

    d3.select(this)
      .selectAll("path.area")
      .data([histogram(data)])
      .join("path")
      .classed("area", true)
      .attr("stroke-width", 1.5)
      .attr("fill-opacity", 0.3)
      .attr(
        "d",
        d3
          .area()
          .x(d => x(d.x0))
          .y0(d => reverseY(d.length) + 5)
          .y1(d => y(d.length) - 5)
          .curve(d3.curveMonotoneX)
      );

    const barHeight = 8;
    const arrayData = data.map(d => d.duration).sort(d3.ascending);
    d3.select(this)
      .selectAll("rect.violinbar")
      .data([arrayData])
      .join("rect")
      .classed("violinbar", true)
      .attr("y", y(0) - barHeight / 2)
      .attr("x", d => x(d3.quantile(d, 0.25)))
      .attr("width", d => x(d3.quantile(d, 0.75)) - x(d3.quantile(d, 0.25)))
      .attr("stroke", "black")
      .attr("fill-opacity", 0.7)
      .attr("height", barHeight);

    d3.select(this)
      .selectAll("circle.violinmedian")
      .data([arrayData])
      .join("circle")
      .classed("violinmedian", true)
      .attr("cy", y(0))
      .attr("cx", d => x(d3.median(d)))
      .attr("r", barHeight / 2)
      .attr("fill", "white")
      .attr("stroke", "black");
  });*/
}

export { draw };
