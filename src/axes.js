import {AxisX, AxisY} from "./axis.js";

export function Axes(
  {x: xScale, y: yScale, fx: fxScale, fy: fyScale},
  {x = {}, y = {}, fx = {}, fy = {}, grid, facet: {grid: facetGrid} = {}} = {}
) {
  let {axis: xAxis = true} = x;
  let {axis: yAxis = true} = y;
  let {axis: fxAxis = true} = fx;
  let {axis: fyAxis = true} = fy;
  if (xAxis === true) xAxis = "bottom";
  if (yAxis === true) yAxis = "left";
  if (fxAxis === true) fxAxis = xAxis === "bottom" ? "top" : "bottom";
  if (fyAxis === true) fyAxis = yAxis === "left" ? "right" : "left";
  return {
    ...xScale && xAxis && {x: new AxisX({grid, ...x, axis: xAxis})},
    ...yScale && yAxis && {y: new AxisY({grid, ...y, axis: yAxis})},
    ...fxScale && fxAxis && {fx: new AxisX({name: "fx", grid: facetGrid, ...fx, axis: fxAxis})},
    ...fyScale && fyAxis && {fy: new AxisY({name: "fy", grid: facetGrid, ...fy, axis: fyAxis})}
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
export function autoAxisLabels(channels, scales, {x, y, fx, fy}, dimensions) {
  if (fx) {
    autoAxisLabelsX(fx, scales.fx, channels.get("fx"));
    if (fx.labelOffset === undefined) {
      const {facetMarginTop, facetMarginBottom} = dimensions;
      fx.labelOffset = fx.axis === "top" ? facetMarginTop : facetMarginBottom;
    }
  }
  if (fy) {
    autoAxisLabelsY(fy, fx, scales.fy, channels.get("fy"));
    if (fy.labelOffset === undefined) {
      const {facetMarginLeft, facetMarginRight} = dimensions;
      fy.labelOffset = fy.axis === "left" ? facetMarginLeft : facetMarginRight;
    }
  }
  if (x) {
    autoAxisLabelsX(x, scales.x, channels.get("x"));
    if (x.labelOffset === undefined) {
      const {marginTop, marginBottom, facetMarginTop, facetMarginBottom} = dimensions;
      x.labelOffset = x.axis === "top" ? marginTop - facetMarginTop : marginBottom - facetMarginBottom;
    }
  }
  if (y) {
    autoAxisLabelsY(y, x, scales.y, channels.get("y"));
    if (y.labelOffset === undefined) {
      const {marginRight, marginLeft, facetMarginLeft, facetMarginRight} = dimensions;
      y.labelOffset = y.axis === "left" ? marginLeft - facetMarginLeft : marginRight - facetMarginRight;
    }
  }
}

function autoAxisLabelsX(axis, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = scale.type === "ordinal" ? "center"
      : scale.invert ? "left"
      : "right";
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "x");
  }
}

function autoAxisLabelsY(axis, opposite, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = scale.type === "ordinal" ? "center"
      : opposite && opposite.axis === "top" ? "bottom" // TODO scale.invert?
      : "top";
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
