import { sortByBool } from "./utils.js";
function draw(data) {
  const width = 3000;
  const height = 300;
  const margin = { top: 10, left: 10, right: 10, bottom: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const outerCellHeight = innerHeight / 3;
  const outerCellWidth = innerWidth / 13 -13*5; 
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
    .attr("stroke", "none");

  const columnContainers = plot
    .selectAll("g.columnContainer")
    .data(
      [1, 3, 2, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13].map(t =>
        data.filter(d => d.task === t)
      )
    )
    .join("g")
    .classed("lineContainer", true)
    .attr("transform", (_, i) => `translate(${i * (outerCellWidth + 5)},0)`);

  const cell = columnContainers
    .selectAll("g.cellContainer")
    .data(gArr => ["A", "B", "C"].map(g => gArr.filter(d => d.group === g)))
    .join("g")
    .classed("cellContainer", true)
    .attr("transform", (_, i) => `translate(0,${i * outerCellHeight})`);

  

  const innerCellWidth = outerCellWidth /2 - 5;
  const innerCellHeight = outerCellHeight - 5;

  cell
    .append("rect")
    .attr("fill", "snow")
    .attr("stroke", "slategray")
    .attr('stroke-width', 2)
    .attr('x', -1)
    .attr('y', -1)
    .attr("width", outerCellWidth - 3)
    .attr("height", outerCellHeight -3);

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

  const bins = 10;
  const barWidth = innerCellWidth / bins;

  const histogramCell = cell
    .append("g")
    .classed("histogramCell", true)
    .attr("transform", `translate(${innerCellWidth},0)`)
    .each(function(data) {
      const group = data[0].group;
      const parentData = d3.select(this.parentNode.parentNode).data()[0];
      const extent = d3.extent(parentData, e => e.duration);
      const x = d3
        .scaleLinear()
        .domain(extent)
        .range([0, innerCellWidth]);

        
      const horizon = 12;
      const maxLayer = Math.floor(12/horizon)

      const y = d3
        .scaleLinear()
        .domain([0, horizon-1])
        .range([innerCellHeight,0]);

      const max = x.domain()[1];
      const min = x.domain()[0];
      const step = (max - min) / bins;
      const thresholds = d3.range(bins).map(d => min + d * step);
      const histogram = d3
        .histogram()
        .domain(x.domain())
        .thresholds(thresholds)
        .value(d => d.duration);


      const scheme = n => d3.interpolateBlues(n)
      const fgColorFun = count => {
        const fgLayer = Math.floor(count/horizon)
    

        const interpolate = d3.scaleLinear().domain([0,maxLayer]).range([0.2,1.2])
        return d3.color(scheme(interpolate(fgLayer)))
      }
       

      const bgColorFun = count => {
        const bgLayer = Math.floor(count/horizon)-1
        if(bgLayer<0) return 'snow'
        const interpolate = d3.scaleLinear().domain([0,maxLayer]).range([0.2,1.2])
        return d3.color(scheme(interpolate(bgLayer)))
      }

      const bgRetcs = d3
        .select(this)
        .selectAll("rect.bgBar")
        .data(histogram(data))
        .join("rect")
        .classed("bgBar", true)
        .attr("x", arr => {
          return x(arr.x0);
        })
        .attr("y", 0)
        .attr("width", arr => {
          return x(arr.x1) - x(arr.x0)+.8;
        })
        .attr("height", innerCellHeight)
        .attr("fill", arr => {
          return bgColorFun(arr.length)
        })
        .attr("stroke", "none");


        const fgRetcs = d3
        .select(this)
        .selectAll("rect.fgBar")
        .data(histogram(data))
        .join("rect")
        .classed("fgBar", true)
        .attr("x", arr => {
          return x(arr.x0) + (x(arr.x1) - x(arr.x0))*.20;
        })
        .attr("y", arr => {
          return y(arr.length%horizon);
        })
        .attr("width", arr => {
          return (x(arr.x1) - x(arr.x0))*.60;
        })
        .attr("height", arr => {
          return innerCellHeight - y(arr.length%horizon);
        })
        .attr("fill", arr => {
          return fgColorFun(arr.length)
        })
        .attr("stroke", "none")
        .attr('count', arr => arr.length)

    });

  
}

export { draw };
