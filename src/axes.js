import {AxisX, AxisY} from "./axis.js";

export function Axes(
  {x: xScale, y: yScale, fx: fxScale, fy: fyScale},
  {x = {}, y = {}, fx = {}, fy = {}, axis = true, grid, line, label, facet: {axis: facetAxis = axis, grid: facetGrid, label: facetLabel = label} = {}} = {}
) {
  let {axis: xAxis = axis} = x;
  let {axis: yAxis = axis} = y;
  let {axis: fxAxis = facetAxis} = fx;
  let {axis: fyAxis = facetAxis} = fy;
  if (!xScale) xAxis = null; else if (xAxis === true) xAxis = "bottom";
  if (!yScale) yAxis = null; else if (yAxis === true) yAxis = "left";
  if (!fxScale) fxAxis = null; else if (fxAxis === true) fxAxis = xAxis === "bottom" ? "top" : "bottom";
  if (!fyScale) fyAxis = null; else if (fyAxis === true) fyAxis = yAxis === "left" ? "right" : "left";
  return {
    ...xAxis && {x: new AxisX({grid, line, label, ...x, axis: xAxis})},
    ...yAxis && {y: new AxisY({grid, line, label, ...y, axis: yAxis})},
    ...fxAxis && {fx: new AxisX({name: "fx", grid: facetGrid, label: facetLabel, ...fx, axis: fxAxis})},
    ...fyAxis && {fy: new AxisY({name: "fy", grid: facetGrid, label: facetLabel, ...fy, axis: fyAxis})}
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
      : scale.reverse ? "left"
      : "right";
  }
  if (axis.label === undefined) {
    axis.label = inferLabel(channels, scale, axis, "x");
  }
}

function autoAxisLabelsY(axis, opposite, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = scale.type === "ordinal" ? "center"
      : opposite && opposite.axis === "top" ? "bottom" // TODO scale.reverse?
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
    const {percent, reverse} = scale;
    // Ignore the implicit label for temporal scales if it’s simply “date”.
    if (scale.type === "temporal" && /^(date|time|year)$/i.test(candidate)) return;
    if (scale.type !== "ordinal" && (key === "x" || key === "y")) {
      if (percent) candidate = `${candidate} (%)`;
      if (axis.labelAnchor === "center") {
        candidate = `${candidate} →`;
      } else if (key === "x") {
        candidate = reverse ? `← ${candidate}` : `${candidate} →`;
      } else {
        candidate = `${reverse ? "↓ " : "↑ "}${candidate}`;
      }
    }
  }
  return candidate;
}
