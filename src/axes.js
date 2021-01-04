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
    ...xScale && xAxis && {x: new AxisX({grid, ...x})},
    ...yScale && yAxis && {y: new AxisY({grid, ...y})},
    ...fxScale && fxAxis && {fx: new AxisX({name: "fx", grid: facetGrid, ...fx})},
    ...fyScale && fyAxis && {fy: new AxisY({name: "fy", grid: facetGrid, ...fy})}
  };
}

// Mutates axis.ticks!
// TODO Populate tickFormat if undefined, too?
export function autoAxisTicks({x, y, fx, fy}, {x: xAxis, y: yAxis, fx: fxAxis, fy: fyAxis}) {
  if (fxAxis) autoAxisTicksK(fx, fxAxis, 80);
  if (fyAxis) autoAxisTicksK(fy, fyAxis, 35);
  if (xAxis) autoAxisTicksK(x, xAxis, 80);
  if (yAxis) autoAxisTicksK(y, yAxis, 35);
}

function autoAxisTicksK(scale, axis, k) {
  if (axis.ticks === undefined) {
    const [min, max] = scale.scale.range();
    axis.ticks = Math.abs(max - min) / k;
    console.log(axis.ticks);
  }
}

// Mutates axis.{label,labelAnchor,labelOffset}!
export function autoAxisLabels(channels, scales, axes, dimensions) {
  if (axes.fx) {
    const {facetMarginTop, facetMarginBottom} = dimensions;
    const margins = {marginTop: facetMarginTop, marginBottom: facetMarginBottom};
    autoAxisLabelsX(axes.fx, scales.fx, channels.get("fx"), margins);
  }
  if (axes.fy) {
    const {facetMarginLeft, facetMarginRight} = dimensions;
    const margins = {marginLeft: facetMarginLeft, marginRight: facetMarginRight};
    autoAxisLabelsY(axes.fy, axes.fx, scales.fy, channels.get("fy"), margins);
  }
  if (axes.x) autoAxisLabelsX(axes.x, scales.x, channels.get("x"), dimensions);
  if (axes.y) autoAxisLabelsY(axes.y, axes.x, scales.y, channels.get("y"), dimensions);
}

function autoAxisLabelsX(axis, scale, channels, margins) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = scale.type === "ordinal" ? "center"
      : scale.invert ? "left"
      : "right";
  }
  if (axis.labelOffset === undefined) {
    const {marginTop, marginBottom} = margins;
    axis.labelOffset = axis.axis === "top" ? marginTop : marginBottom;
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "x");
  }
}

function autoAxisLabelsY(axis, opposite, scale, channels, margins) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = scale.type === "ordinal" ? "center"
      : opposite && opposite.axis === "top" ? "bottom" // TODO scale.invert?
      : "top";
  }
  if (axis.labelOffset === undefined) {
    const {marginRight, marginLeft} = margins;
    axis.labelOffset = axis.axis === "left" ? marginLeft : marginRight;
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "y");
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
