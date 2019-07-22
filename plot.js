import { sortByBool } from "./utils.js";
function draw(data) {
  const width = 1000;
  const height = 300;
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

  const verticalContainerPad = 5;
  const verticalContainerWidth = innerWidth / 13 - verticalContainerPad;
  const verticalContainerHeight = innerHeight;
  const verticalContainers = plot
    .selectAll("g.verticalContainer")
    .data(
      [1, 3, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13].map(t =>
        data.filter(d => d.task === t)
      )
    )
    .join("g")
    .classed("verticalContainer", true)
    .attr(
      "transform",
      (_, i) =>
        `translate(${i * (verticalContainerWidth + verticalContainerPad)},0)`
    );

  const timeContainerWidth = verticalContainerWidth;
  const timeContainerHeight =
    0.5 * verticalContainerHeight - verticalContainerPad / 2;
  const timeContainers = verticalContainers
    .append("g")
    .classed("timeContainers", true);

  const accuracyContainerWidth = verticalContainerWidth;
  const accuracyContainerHeight =
    0.5 * verticalContainerHeight - verticalContainerPad / 2;
  const accuracyContainers = verticalContainer
    .append("g")
    .attr(
      "transform",
      `translate(0,${0.5 * verticalContainerHeight + verticalContainerPad / 2})`
    );

  accuracyContainers
    .append("rect")
    .attr("width", timeContainerWidth)
    .attr("height", timeContainerHeight)
    .attr("fill", "firebrick");

  timeContainers
    .append("rect")
    .attr("width", timeContainerWidth)
    .attr("height", timeContainerHeight)
    .attr("fill", "steelblue");

  verticalContainers
    .append("rect")
    .attr("width", verticalContainerWidth)
    .attr("height", innerHeight)
    .attr("fill", "none")
    .attr("stroke", "black");

  const violinPlotVerticalSpace = 0.8 * innerHeight;
  const tribellVerticalSpace = 0.2 * innerHeight;

  const violinPlots = verticalContainers
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

  const tribells = verticalContainers
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
      .range([0, verticalContainerWidth + verticalContainerPad + 2]);

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
  });
}

export { draw };
