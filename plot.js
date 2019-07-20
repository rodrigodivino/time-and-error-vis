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


  const verticalContainerPad = 5
  const verticalContainerWidth = (innerWidth)/13 - verticalContainerPad
  const verticalContainers = plot
    .selectAll("g.verticalContainer")
    .data(
      [1, 3, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13].map(t =>
        data.filter(d => d.task === t)
      )
    )
    .join("g")
    .classed("verticalContainer", true)
    .attr("transform", (_, i) => 
    `translate(${i * (verticalContainerWidth+verticalContainerPad)},0)`);

    verticalContainers.append('rect').attr('width', verticalContainerWidth)
    .attr('height', innerHeight).attr('fill', 'none').attr('stroke', 'black')

    const violinPlotVerticalSpace = .8*innerHeight
    const tribellVerticalSpace = .2*innerHeight

  const violinPlots = verticalContainers
    .selectAll("g.violinPlotContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("violinPlotContainer", true)
    .attr("transform", (_, i) => `translate(0,${i * (violinPlotVerticalSpace/3)})`)
    .attr('fill', (_,i)=>d3.schemeCategory10[i])

  const tribells = verticalContainers.selectAll('g.tribellContainer')
  .data(d=>[d]).join('g').classed('tribellContainer', true)
  .attr('transform', `translate(0,${violinPlotVerticalSpace})`)

  const bins = 10;
  violinPlots.each(function(data){
      const parentData = d3.select(this.parentNode).data()[0];
      
      const extent = d3.extent(parentData, e => e.duration);
      const x = d3
        .scaleLinear()
        .domain(extent)
        .range([0, verticalContainerWidth]);


      const y = d3
        .scaleLinear()
        .domain([0, 9])
        .range([violinPlotVerticalSpace/6,0]);

      const reverseY =d3
      .scaleLinear()
      .domain([0, 9])
      .range([violinPlotVerticalSpace/6,violinPlotVerticalSpace/3]);

      const max = x.domain()[1];
      const min = x.domain()[0];
      const step = (max - min) / bins;
      const thresholds = d3.range(bins).map(d => min + d * step);
      const histogram = d3
        .histogram()
        .domain(x.domain())
        .thresholds(thresholds)
        .value(d => d.duration);

      
      d3.select(this).selectAll('path.areaUp').data([histogram(data)])
      .join('path')
      .classed('areaUp',true)
      .attr('stroke', 'none')
      .attr('d', d3.area()
      .x(d=>x(d.x0))
      .y0(y(0))
      .y1(d=>y(d.length))
      .curve(d3.curveMonotoneX)

      )

      d3.select(this).selectAll('path.areaBot').data([histogram(data)])
      .join('path')
      .classed('areaBot',true)
      .attr('stroke', 'none')
      .attr('d', d3.area()
      .x(d=>x(d.x0))
      .y0(y(0))
      .y1(d=>reverseY(d.length))
      .curve(d3.curveMonotoneX)

      )
      

    })
  

  
}

export { draw };

