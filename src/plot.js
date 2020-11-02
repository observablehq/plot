import {axisTop, axisRight, axisBottom, axisLeft} from "d3-axis";
import {interpolateRound} from "d3-interpolate";
import {create} from "d3-selection";

export function Plot(x, y, options = {}) {
  let {
    axes = true, // convenience for xAxis, yAxis
    x: {axis: xAxis = axes} = {}, // true = bottom, top, false
    y: {axis: yAxis = axes} = {} // true = left, right, false
  } = options;

  // Convenience aliases.
  if (xAxis === true) xAxis = "bottom"; else if (!xAxis) xAxis = null;
  if (yAxis === true) yAxis = "left"; else if (!yAxis) yAxis = null;

  let {
    width = 640,
    height = y ? 396 : 60,
    marginTop = !yAxis ? 0 : xAxis === "top" ? 30 : 20,
    marginRight = yAxis === "right" ? 40 : 20,
    marginBottom = 30,
    marginLeft = !yAxis || yAxis === "right" ? 20 : 40,
    grid, // convenience for xGrid, yGrid
    x: {
      grid: xGrid = grid, // true, false
      offset: xOffset = 0,
      nice: xNice,
      ticks: xTicks = (width - marginLeft - marginRight) / 80, // optional number or array
      tickSize: xTickSize = 6,
      label: xLabel, // optional string
      labelAnchor: xLabelAnchor = "right", // or center
      labelOffset: xLabelOffset = xAxis === "top" ? marginTop : marginBottom,
      format: xFormat // optional format string or function
    } = {},
    y: {
      grid: yGrid = grid, // true, false
      offset: yOffset = 0,
      nice: yNice,
      ticks: yTicks = (height - marginTop - marginBottom) / 25, // optional number or array
      tickSize: yTickSize = 6,
      label: yLabel, // optional string
      labelAnchor: yLabelAnchor = xAxis === "top" ? "bottom" : "top", // or center
      labelOffset: yLabelOffset = yAxis === "left" ? marginLeft : marginRight,
      format: yFormat // optional format string or function
    } = {},
    render // optional render function
  } = options;

  // Validate orientations.
  if (![null, "bottom", "top"].includes(xAxis)) throw new Error("invalid xAxis");
  if (![null, "left", "right"].includes(yAxis)) throw new Error("invalid yAxis");
  if (!["left", "right", "center"].includes(xLabelAnchor)) throw new Error("invalid xLabelAnchor");
  if (!["top", "bottom", "center"].includes(yLabelAnchor)) throw new Error("invalid yLabelAnchor");

  // Positive offsets point outward.
  if (xAxis === "top") xOffset *= -1, xLabelOffset *= -1;
  if (yAxis === "left") yOffset *= -1, yLabelOffset *= -1;

  // Nice domains
  if (xNice === true) xNice = xTicks;
  if (yNice === true) yNice = yTicks;
  if (x && x.nice && xNice) x.nice(xNice);
  if (y && y.nice && yNice) y.nice(yNice);

  // Ranges
  if (x) x.range([marginLeft, width - marginRight]);
  if (y) y.range([height - marginBottom, marginTop]);
  if (!x && !y) throw new Error("either x or y must be specified, or both");

  // Rounded scales for pixel-snapped axes.
  const xRound = x && round(x);
  const yRound = y && round(y);

  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", `${width}px`)
      .style("display", "block");

  // TODO Allow shifting the x-axis to y = 0?
  // TODO Show xLabel even if xAxis is false?
  if (xAxis) svg.append("g")
      .attr("transform", `translate(0,${xOffset + (xAxis === "top" ? marginTop : height - marginBottom)})`)
      .call((xAxis === "top" ? axisTop : axisBottom)(xRound)
          .ticks(Array.isArray(xTicks) ? null : xTicks, typeof xFormat === "function" ? null : xFormat)
          .tickFormat(typeof xFormat === "function" || !x.tickFormat ? xFormat : null)
          .tickSizeInner(xTickSize)
          .tickSizeOuter(0)
          .tickValues(Array.isArray(xTicks) ? xTicks : null))
      .call(g => g.select(".domain").remove())
      .call(xLabel == null ? () => {} : g => g.append("text")
          .attr("fill", "currentColor")
          .attr("transform", `translate(${
              xLabelAnchor === "center" ? (width + marginLeft - marginRight) / 2
                : xLabelAnchor === "right" ? width
                : 0
            },${xLabelOffset})`)
          .attr("dy", xAxis === "top" ? "1em" : "-0.32em")
          .attr("text-anchor", xLabelAnchor === "center" ? "middle"
              : xLabelAnchor === "right" ? "end"
              : "start")
          .text(xLabel));

  // TODO Allow shifting the y-axis to x = 0?
  // TODO Show yLabel even if yAxis is false?
  if (yAxis) svg.append("g")
      .attr("transform", `translate(${yOffset + (yAxis === "right" ? width - marginRight : marginLeft)},0)`)
      .call((yAxis === "right" ? axisRight : axisLeft)(yRound)
          .ticks(Array.isArray(yTicks) ? null : yTicks, typeof yFormat === "function" ? null : yFormat)
          .tickFormat(typeof yFormat === "function" || !y.tickFormat ? yFormat : null)
          .tickSizeInner(yTickSize)
          .tickSizeOuter(0)
          .tickValues(Array.isArray(yTicks) ? yTicks : null))
      .call(g => g.select(".domain").remove())
      .call(yLabel == null ? () => {} : g => g.append("text")
          .attr("fill", "currentColor")
          .attr("transform", `translate(${yLabelOffset},${
              yLabelAnchor === "center" ? (height + marginTop - marginBottom) / 2
                : yLabelAnchor === "bottom" ? height - marginBottom
                : marginTop
            })${yLabelAnchor === "center" ? ` rotate(-90)` : ""}`)
          .attr("dy", yLabelAnchor === "center" ? (yAxis === "right" ? "-0.32em" : "0.75em")
              : yLabelAnchor === "bottom" ? "1.4em"
              : "-1em")
          .attr("text-anchor", yLabelAnchor === "center" ? "middle"
              : yAxis === "right" ? "end"
              : "start")
          .text(yLabel));

  // TODO Configurable stroke-opacity, stroke-dasharray, stroke-width.
  // TODO Allow different ticks (e.g., subdivision) for grid?
  // Perhaps xGrid and yGrid could be a number or an array of values?
  if (xGrid || yGrid) svg.append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call(xGrid ? g => g.selectAll()
        .data(Array.isArray(xTicks) ? xTicks : ticks(xRound, xTicks))
        .join("line")
          .attr("x1", d => tick(xRound, d))
          .attr("x2", d => tick(xRound, d))
          .attr("y1", marginTop)
          .attr("y2", height - marginBottom) : () => {})
      .call(yGrid ? g => g.selectAll()
        .data(Array.isArray(yTicks) ? yTicks : ticks(yRound, yTicks))
        .join("line")
          .attr("y1", d => tick(yRound, d))
          .attr("y2", d => tick(yRound, d))
          .attr("x1", marginLeft)
          .attr("x2", width - marginRight) : () => {});

  if (render) svg.append(() => render(x, y, {
    width,
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  }));

  return svg.node();
}

function round(scale) {
  return scale.round
      ? scale.round(true) // mutates band and point scales!
      : scale.copy().interpolate(interpolateRound);
}

function ticks(scale, ticks) {
  return scale.ticks
      ? scale.ticks(ticks)
      : scale.domain(); // band and point scales don’t have ticks
}

function tick(scale, value) {
  return 0.5 + scale(value) + (scale.bandwidth
      ? scale.bandwidth() / 2 // center ticks for band scales
      : 0);
}
