import {group} from "d3-array";
import {create} from "d3-selection";
import {AxisX, AxisY} from "./marks/axis.js";
import {ScaleLinear, ScalePow, ScaleLog, ScaleSymlog} from "./scales/quantitative.js";
import {ScaleTime, ScaleUtc} from "./scales/temporal.js";
import {ScalePoint, ScaleBand} from "./scales/ordinal.js";

export function plot(data, options = {}) {
  const marks = Marks(data, options.marks);
  const encodings = Encodings(marks);
  const scales = Scales(encodings, options.scales);
  const axes = Axes(scales, options.axes);
  const dimensions = Dimensions(scales, axes, options);

  autoScaleRange(scales, dimensions);
  autoAxisTicks(axes, dimensions);
  autoAxisLabels(encodings, scales, axes, dimensions);

  if (axes.y) marks.unshift(axes.y);
  if (axes.x) marks.unshift(axes.x);

  const {width, height} = dimensions;

  const svg = create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", `${width}px`)
      .style("display", "block");

  for (const m of marks) {
    const node = m.render(scales, dimensions);
    if (node !== null) svg.append(() => node);
  }

  return svg.node();
}

function Encodings(marks) {
  return group(
    marks.flatMap(m => Object.values(m.channels).filter(({scale}) => scale)),
    ({scale}) => scale
  );
}

// TODO Don’t mutate channels in-place?
function Marks(data, marks = []) {
  for (const mark of marks) {
    mark.channels = Object.fromEntries(Array.from(
      Object.entries(mark.channels).filter(([, channel]) => channel),
      ([name, channel]) => [name, Channel(data, channel)]
    ));
  }
  return marks;
}

function Channel(data, {scale = null, value, label}) {
  if (typeof value === "string") label = value, value = Array.from(data, Field(value));
  else if (typeof value === "function") value = Array.from(data, value);
  else if (typeof value.length !== "number") value = Array.from(value);
  return {scale, value, label};
}

function Field(value) {
  return d => d[value];
}

function Scales(encodings, options = {}) {
  const keys = new Set([...Object.keys(options), ...encodings.keys()]);
  const scales = {};
  for (const key of keys) scales[key] = Scale(encodings.get(key), options[key]);
  return scales
}

function Scale(encodings, options = {}) {
  switch (inferType(encodings, options)) {
    case "linear": return ScaleLinear(encodings, options);
    case "pow": return ScalePow(encodings, options);
    case "log": return ScaleLog(encodings, options);
    case "symlog": return ScaleSymlog(encodings, options);
    case "utc": return ScaleUtc(encodings, options);
    case "time": return ScaleTime(encodings, options);
    case "point": return ScalePoint(encodings, options);
    case "band": return ScaleBand(encodings, options);
    default: throw new Error(`unknown scale type: ${options.type}`);
  }
}

function inferType(encodings, {type, domain}) {
  if (type !== undefined) return type;
  if (domain !== undefined) {
    if (domain.length > 2) return "point";
    type = inferTypeFromValues(domain);
    if (type !== undefined) return type;
  }
  for (const {value} of encodings) {
    type = inferTypeFromValues(value);
    if (type !== undefined) return type;
  }
  return "linear";
}

function inferTypeFromValues(values) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string") return "point";
    else if (value instanceof Date) return "utc";
    return "linear";
  }
}

function Dimensions({y}, {x: xAxis, y: yAxis}, {
  width = 640,
  height = y ? 396 : 60,
  marginTop = !yAxis ? 0 : xAxis?.anchor === "top" ? 30 : 20,
  marginRight = yAxis?.anchor === "right" ? 40 : 20,
  marginBottom = xAxis?.anchor === "bottom" ? 30 : 20,
  marginLeft = yAxis?.anchor === "left" ? 40 : 20
} = {}) {
  return {width, height, marginTop, marginRight, marginBottom, marginLeft};
}

function Axes({x, y}, {x: xAxis = {}, y: yAxis = {}, grid} = {}) {
  return {
    x: x && xAxis ? new AxisX({grid, ...xAxis}) : null,
    y: y && yAxis ? new AxisY({grid, ...yAxis}) : null
  };
}

// Mutates scales.{x,y}.scale.range!
function autoScaleRange(scales, dimensions) {
  if (scales.x) {
    const {width, marginLeft, marginRight} = dimensions;
    scales.x.scale.range([marginLeft, width - marginRight]);
  }
  if (scales.y) {
    const {height, marginTop, marginBottom} = dimensions;
    scales.y.scale.range([height - marginBottom, marginTop]);
  }
}

// Mutates axes.{x,y}.ticks!
// TODO Populate tickFormat if undefined, too?
function autoAxisTicks(axes, dimensions) {
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
function autoAxisLabels(encodings, scales, axes, dimensions) {
  if (axes.x) {
    if (axes.x.label === undefined) {
      axes.x.label = inferLabel(encodings, scales, "x");
    }
    if (axes.x.labelAnchor === undefined) {
      axes.x.labelAnchor = ["point", "band"].includes(scales.x.type) ? "center"
        : scales.x.invert ? "left"
        : "right";
    }
    if (axes.x.labelOffset === undefined) {
      const {marginTop, marginBottom} = dimensions;
      axes.x.labelOffset = axes.x.anchor === "top" ? marginTop : marginBottom;
    }
  }
  if (axes.y) {
    if (axes.y.label === undefined) {
      axes.y.label = inferLabel(encodings, scales, "y");
    }
    if (axes.y.labelAnchor === undefined) {
      axes.y.labelAnchor = ["point", "band"].includes(scales.y.type) ? "center"
        : axes.x && axes.x.anchor === "top" ? "bottom"
        : "top";
    }
    if (axes.y.labelOffset === undefined) {
      const {marginRight, marginLeft} = dimensions;
      axes.y.labelOffset = axes.y.anchor === "left" ? marginLeft : marginRight;
    }
  }
}

// Encodings can have labels; if all the encodings for a given scale are
// consistently labeled (i.e., have the same value if not undefined), and
// the corresponding axis doesn’t already have an explicit label, then the
// encodings’ label is promoted to the corresponding axis.
function inferLabel(encodings, scales, key) {
  let candidate;
  for (const {label} of encodings.get(key)) {
    if (candidate === undefined) candidate = label;
    else if (candidate !== label) return;
  }
  if (candidate !== undefined) {
    const {invert} = scales[key];
    const prefix = key === "y" ? (invert ? "↓ " : "↑ ") : key === "x" && invert ? "← " : "";
    const suffix = key === "x" && !invert ? " →" : "";
    candidate = `${prefix}${candidate}${suffix}`;
  }
  return candidate;
}
