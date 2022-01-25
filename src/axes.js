import {extent} from "d3";
import {AxisX, AxisY} from "./axis.js";
import {isOrdinalScale, isTemporalScale, scaleOrder} from "./scales.js";
import {position, registry} from "./scales/index.js";

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
    ...xAxis && {x: new AxisX({grid, line, label, fontVariant: inferFontVariant(xScale), ...x, axis: xAxis})},
    ...yAxis && {y: new AxisY({grid, line, label, fontVariant: inferFontVariant(yScale), ...y, axis: yAxis})},
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
    const [min, max] = extent(scale.scale.range());
    axis.ticks = (max - min) / k;
  }
}

// Mutates axis.{label,labelAnchor,labelOffset} and scale.label!
export function autoScaleLabels(channels, scales, {x, y, fx, fy}, dimensions, options) {
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
  for (const [key, type] of registry) {
    if (type !== position && scales[key]) { // not already handled above
      autoScaleLabel(scales[key], channels.get(key), options[key]);
    }
  }
}

// Mutates axis.labelAnchor, axis.label, scale.label!
function autoAxisLabelsX(axis, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = isOrdinalScale(scale) ? "center"
      : scaleOrder(scale) < 0 ? "left"
      : "right";
  }
  autoScaleLabel(scale, channels, axis);
  autoAxisLabel("x", scale, axis);
}

// Mutates axis.labelAnchor, axis.label, scale.label!
function autoAxisLabelsY(axis, opposite, scale, channels) {
  if (axis.labelAnchor === undefined) {
    axis.labelAnchor = isOrdinalScale(scale) ? "center"
      : opposite && opposite.axis === "top" ? "bottom" // TODO scaleOrder?
      : "top";
  }
  autoScaleLabel(scale, channels, axis);
  autoAxisLabel("y", scale, axis);
}

// Mutates scale.label, axis.labelArrow!
function autoScaleLabel(scale, channels, axis) {
  if (axis) scale.label = axis.label; // propagate manual label, if any, to scale
  if (scale.label === undefined) {
    scale.label = inferLabel(channels, scale);
    if (axis) axis.label = scale.label; // propagate automatic label, if used, to axis
  } else if (axis?.labelArrow === "auto") {
    axis.labelArrow = "none"; // clear default label arrow if explicit label
  }
}

// Mutates axis.label!
function autoAxisLabel(key, scale, axis) {
  let {label, labelAnchor, labelArrow} = axis;
  if (label != null) {
    if (labelArrow === "auto" && !isOrdinalScale(scale)) {
      const order = scaleOrder(scale);
      if (order) {
        if (key === "x" || labelAnchor === "center") {
          labelArrow = key === "x" === order < 0 ? "left" : "right";
        } else {
          labelArrow = order < 0 ? "up" : "down";
        }
      }
    }
    switch (labelArrow) {
      case "left": label = `← ${label}`; break;
      case "right": label = `${label} →`; break;
      case "up": label = `↑ ${label}`; break;
      case "down": label = `↓ ${label}`; break;
    }
    axis.label = label;
  }
}

// Channels can have labels; if all the channels for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and the
// corresponding axis doesn’t already have an explicit label, then the channels’
// label is promoted to the corresponding axis.
function inferLabel(channels = [], scale) {
  let label;
  for (const {label: channelLabel} of channels) {
    if (channelLabel === undefined) continue;
    if (label === undefined) label = channelLabel;
    else if (label !== channelLabel) return;
  }
  if (label !== undefined) {
    // Ignore the implicit label for temporal scales if it’s simply “date”.
    if (isTemporalScale(scale) && /^(date|time|year)$/i.test(label)) return;
    if (!isOrdinalScale(scale) && scale.percent) label = `${label} (%)`;
  }
  return label;
}

export function inferFontVariant(scale) {
  return isOrdinalScale(scale) ? undefined : "tabular-nums";
}
