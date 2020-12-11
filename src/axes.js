import {AxisX, AxisY} from "./marks/axis.js";

export function Axes(
  {x: xScale, y: yScale, fx: fxScale, fy: fyScale},
  {x = {}, y = {}, fx = {}, fy = {}, grid, facet: {grid: facetGrid} = {}} = {}
) {
  const {axis: xAxis = true} = x;
  const {axis: yAxis = true} = y;
  const {axis: fxAxis = true} = fx;
  const {axis: fyAxis = true} = fy;
  return {
    x: xScale && xAxis ? new AxisX({grid, ...x}) : null,
    y: yScale && yAxis ? new AxisY({grid, ...y}) : null,
    fx: fxScale && fxAxis ? new AxisX({name: "fx", grid: facetGrid, ...fx}) : null,
    fy: fyScale && fyAxis ? new AxisY({name: "fy", grid: facetGrid, ...fy}) : null
  };
}

// Mutates axes.{x,y}.ticks!
// TODO Populate tickFormat if undefined, too?
export function autoAxisTicks(axes, dimensions) {
  if (axes.x && axes.x.ticks === undefined) {
    const {width, marginRight, marginLeft} = dimensions;
    axes.x.ticks = (width - marginLeft - marginRight) / 80;
  }
  if (axes.y && axes.y.ticks === undefined) {
    const {height, marginTop, marginBottom} = dimensions;
    axes.y.ticks = (height - marginTop - marginBottom) / 35;
  }
}

// Mutates axes.{x,y}.label!
// Mutates axes.{x,y}.labelAnchor!
// Mutates axes.{x,y}.labelOffset!
export function autoAxisLabels(channels, scales, axes, dimensions) {
  if (axes.x) {
    if (axes.x.labelAnchor === undefined) {
      axes.x.labelAnchor = scales.x.type === "ordinal" ? "center"
        : scales.x.invert ? "left"
        : "right";
    }
    if (axes.x.labelOffset === undefined) {
      const {marginTop, marginBottom} = dimensions;
      axes.x.labelOffset = axes.x.axis === "top" ? marginTop : marginBottom;
    }
    if (axes.x.label === undefined) {
      axes.x.label = inferLabel(channels.get("x"), scales.x, axes.x, "x");
    }
  }
  if (axes.y) {
    if (axes.y.labelAnchor === undefined) {
      axes.y.labelAnchor = scales.y.type === "ordinal" ? "center"
        : axes.x && axes.x.axis === "top" ? "bottom"
        : "top";
    }
    if (axes.y.labelOffset === undefined) {
      const {marginRight, marginLeft} = dimensions;
      axes.y.labelOffset = axes.y.axis === "left" ? marginLeft : marginRight;
    }
    if (axes.y.label === undefined) {
      axes.y.label = inferLabel(channels.get("y"), scales.y, axes.y, "y");
    }
  }
}

// Channels can have labels; if all the channels for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and the
// corresponding axis doesn’t already have an explicit label, then the channels’
// label is promoted to the corresponding axis.
function inferLabel(channels = [], scale, axis, key) {
  let candidate;
  for (const {label} of channels) {
    if (label === undefined) continue;
    if (candidate === undefined) candidate = label;
    else if (candidate !== label) return;
  }
  if (candidate !== undefined) {
    const {invert} = scale;
    if (axis.labelAnchor !== "center") {
      const prefix = key === "y" ? (invert ? "↓ " : "↑ ") : key === "x" && invert ? "← " : "";
      const suffix = key === "x" && !invert ? " →" : "";
      candidate = `${prefix}${candidate}${suffix}`;
    }
  }
  return candidate;
}
