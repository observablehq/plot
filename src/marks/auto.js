import {ascending, InternSet} from "d3";
import {marks} from "../mark.js";
import {isColor, isObject, isOptions, isOrdinal, labelof, valueof} from "../options.js";
import {bin, binX, binY} from "../transforms/bin.js";
import {group, groupX, groupY} from "../transforms/group.js";
import {areaX, areaY} from "./area.js";
import {barX, barY} from "./bar.js";
import {cell} from "./cell.js";
import {dot} from "./dot.js";
import {frame} from "./frame.js";
import {line, lineX, lineY} from "./line.js";
import {rectX, rectY} from "./rect.js";
import {ruleX, ruleY} from "./rule.js";

export function autoSpec(data, options) {
  const {x, y, fx, fy, color, size, mark} = autoImpl(data, options);
  return {x, y, fx, fy, color, size, mark};
}

function autoImpl(data, options) {
  options = normalizeOptions(options);

  // Greedily materialize columns for type inference; we’ll need them anyway to
  // plot! Note that we don’t apply any type inference to the fx and fy
  // channels, if present; these are always ordinal (at least for now).
  const {x, y, color, size} = options;
  const X = materializeValue(data, x);
  const Y = materializeValue(data, y);
  const C = materializeValue(data, color);
  const S = materializeValue(data, size);

  // Compute the default options.
  let {
    fx,
    fy,
    x: {value: xValue, reduce: xReduce, zero: xZero, ...xOptions},
    y: {value: yValue, reduce: yReduce, zero: yZero, ...yOptions},
    color: {value: colorValue, color: colorColor, reduce: colorReduce},
    size: {value: sizeValue, reduce: sizeReduce}, // TODO constant radius?
    mark
  } = options;

  // Determine the default reducer, if any.
  if (xReduce === undefined)
    xReduce = yReduce == null && xValue == null && sizeValue == null && yValue != null ? "count" : null;
  if (yReduce === undefined)
    yReduce = xReduce == null && yValue == null && sizeValue == null && xValue != null ? "count" : null;

  // Determine the default size reducer, if any.
  if (
    sizeReduce === undefined &&
    sizeValue == null &&
    colorReduce == null &&
    xReduce == null &&
    yReduce == null &&
    (xValue == null || isOrdinal(X)) &&
    (yValue == null || isOrdinal(Y))
  ) {
    sizeReduce = "count";
  }

  // Determine the default zero-ness.
  if (xZero === undefined) xZero = isZeroReducer(xReduce) ? true : undefined;
  if (yZero === undefined) yZero = isZeroReducer(yReduce) ? true : undefined;

  // TODO Shorthand: array of primitives should result in a histogram
  if (xValue == null && yValue == null) throw new Error("must specify x or y");
  if (xReduce != null && yValue == null) throw new Error("reducing x requires y");
  if (yReduce != null && xValue == null) throw new Error("reducing y requires x");

  // Determine the default mark type.
  if (mark === undefined) {
    mark =
      sizeValue != null || sizeReduce != null
        ? "dot"
        : isZeroReducer(xReduce) || isZeroReducer(yReduce) || colorReduce != null // histogram or heatmap
        ? "bar"
        : xValue != null && yValue != null
        ? isOrdinal(X) || isOrdinal(Y) || (xReduce == null && yReduce == null && !isMonotonic(X) && !isMonotonic(Y))
          ? "dot"
          : "line"
        : xValue != null || yValue != null
        ? "rule"
        : null;
  }

  let Z; // may be set to null to disable series-by-color for line and area
  let colorMode; // "fill" or "stroke"

  // Determine the mark implementation.
  let markImpl;
  switch (mark) {
    case "dot":
      markImpl = dot;
      colorMode = "stroke";
      break;
    case "line":
      markImpl = X && Y ? line : X ? lineX : lineY; // 1d line by index
      colorMode = "stroke";
      if (isHighCardinality(C)) Z = null; // TODO only if z not set by user
      break;
    case "area":
      markImpl = yZero ? areaY : xZero || (Y && isMonotonic(Y)) ? areaX : areaY; // favor areaY if unsure
      colorMode = "fill";
      if (isHighCardinality(C)) Z = null; // TODO only if z not set by user
      break;
    case "rule":
      markImpl = X ? ruleX : ruleY;
      colorMode = "stroke";
      break;
    case "bar":
      markImpl = yZero
        ? isOrdinalReduced(xReduce, X)
          ? barY
          : rectY
        : xZero
        ? isOrdinalReduced(yReduce, Y)
          ? barX
          : rectX
        : isOrdinalReduced(xReduce, X) && isOrdinalReduced(yReduce, Y)
        ? cell
        : isOrdinalReduced(xReduce, X)
        ? barY
        : isOrdinalReduced(yReduce, Y)
        ? barX
        : rectY;
      colorMode = "fill";
      break;
    default:
      throw new Error(`invalid mark: ${mark}`);
  }

  // Determine the mark options.
  let markOptions = {
    fx,
    fy,
    x: X ?? undefined, // treat null x as undefined for implicit stack
    y: Y ?? undefined, // treat null y as undefined for implicit stack
    [colorMode]: C ?? colorColor,
    z: Z,
    r: S ?? undefined // treat null size as undefined for default constant radius
  };
  let transformImpl;
  let transformOptions = {[colorMode]: colorReduce ?? undefined, r: sizeReduce ?? undefined};
  if (xReduce != null && yReduce != null) {
    throw new Error(`cannot reduce both x and y`); // for now at least
  } else if (yReduce != null) {
    transformOptions.y = yReduce;
    transformImpl = isOrdinal(X) ? groupX : binX;
  } else if (xReduce != null) {
    transformOptions.x = xReduce;
    transformImpl = isOrdinal(Y) ? groupY : binY;
  } else if (colorReduce != null || sizeReduce != null) {
    if (X && Y) {
      transformImpl = isOrdinal(X) && isOrdinal(Y) ? group : isOrdinal(X) ? binY : isOrdinal(Y) ? binX : bin;
    } else if (X) {
      transformImpl = isOrdinal(X) ? groupX : binX;
    } else if (Y) {
      transformImpl = isOrdinal(Y) ? groupY : binY;
    }
  }

  // When using the bin transform, pass through additional options (e.g., thresholds).
  if (transformImpl === bin || transformImpl === binX) markOptions.x = {value: X, ...xOptions};
  if (transformImpl === bin || transformImpl === binY) markOptions.y = {value: Y, ...yOptions};

  // If zero-ness is not specified, default based on whether the resolved mark
  // type will include a zero baseline.
  if (xZero === undefined)
    xZero =
      X &&
      !(transformImpl === bin || transformImpl === binX) &&
      (markImpl === barX || markImpl === areaX || markImpl === rectX || markImpl === ruleY);
  if (yZero === undefined)
    yZero =
      Y &&
      !(transformImpl === bin || transformImpl === binY) &&
      (markImpl === barY || markImpl === areaY || markImpl === rectY || markImpl === ruleX);

  return {
    fx: fx ?? null,
    fy: fy ?? null,
    x: {
      value: xValue ?? null,
      reduce: xReduce ?? null,
      zero: !!xZero,
      ...xOptions
    },
    y: {
      value: yValue ?? null,
      reduce: yReduce ?? null,
      zero: !!yZero,
      ...yOptions
    },
    color: {
      value: colorValue ?? null,
      reduce: colorReduce ?? null,
      ...(colorColor !== undefined && {color: colorColor})
    },
    size: {
      value: sizeValue ?? null,
      reduce: sizeReduce ?? null
    },
    mark,
    markImpl,
    markOptions,
    transformImpl,
    transformOptions,
    colorMode
  };
}

export function auto(data, options) {
  const {
    fx,
    fy,
    x: {zero: xZero},
    y: {zero: yZero},
    markImpl,
    markOptions,
    transformImpl,
    transformOptions,
    colorMode
  } = autoImpl(data, options);

  // In the case of filled marks (particularly bars and areas) the frame and
  // rules should come after the mark; in the case of stroked marks
  // (particularly dots and lines) they should come before the mark.
  const frames = fx != null || fy != null ? frame({strokeOpacity: 0.1}) : null;
  const rules = [xZero ? ruleX([0]) : null, yZero ? ruleY([0]) : null];
  const mark = markImpl(data, transformImpl ? transformImpl(transformOptions, markOptions) : markOptions);
  return colorMode === "stroke" ? marks(frames, rules, mark) : marks(frames, mark, rules);
}

// TODO What about sorted within series?
function isMonotonic(values) {
  let previous;
  let previousOrder;
  for (const value of values) {
    if (value == null) continue;
    if (previous === undefined) {
      previous = value;
      continue;
    }
    const order = Math.sign(ascending(previous, value));
    if (!order) continue; // skip zero, NaN
    if (previousOrder !== undefined && order !== previousOrder) return false;
    previous = value;
    previousOrder = order;
  }
  return true;
}

// Allow x and y and other dimensions to be specified as shorthand field names
// (but note that they can also be specified as a {transform} object such as
// Plot.identity). We don’t support reducers for the faceting, but for symmetry
// with x and y we allow facets to be specified as {value} objects.
function normalizeOptions({x, y, color, size, fx, fy, mark} = {}) {
  if (!isOptions(x)) x = makeOptions(x);
  if (!isOptions(y)) y = makeOptions(y);
  if (!isOptions(color)) color = isColor(color) ? {color} : makeOptions(color);
  if (!isOptions(size)) size = makeOptions(size);
  if (isOptions(fx)) ({value: fx} = makeOptions(fx));
  if (isOptions(fy)) ({value: fy} = makeOptions(fy));
  if (mark != null) mark = `${mark}`.toLowerCase();
  return {x, y, color, size, fx, fy, mark};
}

// To apply heuristics based on the data types (values), realize the columns. We
// could maybe look at the data.schema here, but Plot’s behavior depends on the
// actual values anyway, so this probably is what we want.
function materializeValue(data, options) {
  const V = valueof(data, options.value);
  if (V) V.label = labelof(options.value);
  return V;
}

function makeOptions(value) {
  return isReducer(value) ? {reduce: value} : {value};
}

// The distinct, count, sum, and proportion reducers are additive (stackable).
function isZeroReducer(reduce) {
  return /^(?:distinct|count|sum|proportion)$/i.test(reduce);
}

// The first, last, and mode reducers preserve the type of the aggregated values.
function isSelectReducer(reduce) {
  return /^(?:first|last|mode)$/i.test(reduce);
}

// We can’t infer the type of a custom reducer without invoking it, so
// assume most reducers produce quantitative values.
function isOrdinalReduced(reduce, value) {
  return (reduce != null && !isSelectReducer(reduce)) || !value ? false : isOrdinal(value);
}

// https://github.com/observablehq/plot/blob/818562649280e155136f730fc496e0b3d15ae464/src/transforms/group.js#L236
function isReducer(reduce) {
  if (reduce == null) return false;
  if (typeof reduce.reduceIndex === "function") return true;
  if (typeof reduce.reduce === "function" && isObject(reduce)) return true; // N.B. array.reduce
  if (/^p\d{2}$/i.test(reduce)) return true;
  switch (`${reduce}`.toLowerCase()) {
    case "first":
    case "last":
    case "count":
    case "distinct":
    case "sum":
    case "proportion":
    case "proportion-facet": // TODO remove me?
    case "deviation":
    case "min":
    case "min-index": // TODO remove me?
    case "max":
    case "max-index": // TODO remove me?
    case "mean":
    case "median":
    case "variance":
    case "mode":
      // These are technically reducers, but I think we’d want to treat them as fields?
      // case "x":
      // case "x1":
      // case "x2":
      // case "y":
      // case "y1":
      // case "y2":
      return true;
  }
  return false;
}

function isHighCardinality(value) {
  return value ? new InternSet(value).size > value.length >> 1 : false;
}
