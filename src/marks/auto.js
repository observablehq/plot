import {ascending, InternSet} from "d3";
import {isOrdinal, labelof, valueof, isOptions, isColor, isObject} from "../options.js";
import {areaX, areaY} from "./area.js";
import {dot} from "./dot.js";
import {line, lineX, lineY} from "./line.js";
import {ruleX, ruleY} from "./rule.js";
import {barX, barY} from "./bar.js";
import {rect, rectX, rectY} from "./rect.js";
import {cell} from "./cell.js";
import {frame} from "./frame.js";
import {bin, binX, binY} from "../transforms/bin.js";
import {group, groupX, groupY} from "../transforms/group.js";
import {marks} from "../mark.js";

export function autoSpec(data, options) {
  options = normalizeOptions(options);

  let {
    fx,
    fy,
    x: {value: xValue, reduce: xReduce, zero: xZero, ...xOptions},
    y: {value: yValue, reduce: yReduce, zero: yZero, ...yOptions},
    color: {value: colorValue, color: colorColor, reduce: colorReduce},
    size: {value: sizeValue, reduce: sizeReduce}, // TODO constant radius?
    mark
  } = options;

  const {
    x: {value: X},
    y: {value: Y},
    size: {value: S}
  } = materializeValues(data, options);

  // Determine the default reducer, if any.
  if (xReduce === undefined) xReduce = yReduce == null && !X && sizeValue == null && Y ? "count" : null;
  if (yReduce === undefined) yReduce = xReduce == null && !Y && sizeValue == null && X ? "count" : null;

  // Determine the default size reducer, if any.
  if (
    sizeReduce === undefined &&
    sizeValue == null &&
    colorReduce == null &&
    xReduce == null &&
    yReduce == null &&
    (!X || isOrdinal(X)) &&
    (!Y || isOrdinal(Y))
  ) {
    sizeReduce = "count";
  }

  // Determine the default zero-ness.
  if (xZero === undefined) xZero = isZeroReducer(xReduce) ? true : undefined;
  if (yZero === undefined) yZero = isZeroReducer(yReduce) ? true : undefined;

  // TODO Shorthand: array of primitives should result in a histogram
  if (!X && !Y) throw new Error("must specify x or y");
  if (xReduce != null && !Y) throw new Error("reducing x requires y");
  if (yReduce != null && !X) throw new Error("reducing y requires x");

  // Determine the default mark type.
  if (mark === undefined) {
    mark =
      S || sizeReduce != null
        ? "dot"
        : xZero || yZero || colorReduce != null // histogram or heatmap
        ? "bar"
        : X && Y
        ? isOrdinal(X) || isOrdinal(Y) || (xReduce == null && yReduce == null && !isMonotonic(X) && !isMonotonic(Y))
          ? "dot"
          : "line"
        : X || Y
        ? "rule"
        : null;
  }

  return {
    fx: fx ?? null,
    fy: fy ?? null,
    x: {
      value: xValue ?? null,
      reduce: xReduce ?? null,
      ...(xZero !== undefined && {zero: xZero}), // TODO ?? false?
      ...xOptions
    },
    y: {
      value: yValue ?? null,
      reduce: yReduce ?? null,
      ...(yZero !== undefined && {zero: yZero}), // TODO ?? false?
      ...yOptions
    },
    color: {
      value: colorValue ?? null,
      reduce: colorReduce ?? null,
      ...(colorColor !== undefined && {color: colorColor}) // TODO ?? null
    },
    size: {
      value: sizeValue ?? null,
      reduce: sizeReduce ?? null
    },
    mark
  };
}

/** @jsdoc auto */
export function auto(data, options) {
  // By materializing here, we ensure the columns aren’t re-computed later.
  options = materializeValues(data, normalizeOptions(options));

  // Compute the default options via autoSpec.
  let {
    x: {value: X, reduce: xReduce, zero: xZero, ...xOptions},
    y: {value: Y, reduce: yReduce, zero: yZero, ...yOptions},
    color: {value: C, color: colorColor, reduce: colorReduce},
    size: {value: S, reduce: sizeReduce},
    fx,
    fy,
    mark
  } = autoSpec(data, options);

  let Z, zReduce;
  let colorMode; // "fill" or "stroke"

  // Determine the mark implementation.
  if (mark != null) {
    switch (`${mark}`.toLowerCase()) {
      case "dot":
        mark = dot;
        colorMode = "stroke";
        break;
      case "line":
        mark = X && Y ? line : X ? lineX : lineY; // 1d line by index
        colorMode = "stroke";
        if (isHighCardinality(C)) Z = null; // TODO only if z not set by user
        break;
      case "area":
        mark = yZero ? areaY : xZero || (Y && isMonotonic(Y)) ? areaX : areaY; // favor areaY if unsure
        colorMode = "fill";
        if (isHighCardinality(C)) Z = null; // TODO only if z not set by user
        break;
      case "rule":
        mark = X ? ruleX : ruleY;
        colorMode = "stroke";
        break;
      case "bar":
        mark = yZero
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
          : rect;
        colorMode = "fill";
        break;
      default:
        throw new Error(`invalid mark: ${mark}`);
    }
  }

  // Determine the mark options.
  let markOptions = {fx, fy, x: X ?? undefined, y: Y ?? undefined, [colorMode]: C ?? colorColor, z: Z, r: S ?? undefined};
  let transform;
  let transformOptions = {[colorMode]: colorReduce ?? undefined, z: zReduce ?? undefined, r: sizeReduce ?? undefined};
  if (xReduce != null && yReduce != null) {
    throw new Error(`cannot reduce both x and y`); // for now at least
  } else if (yReduce != null) {
    transformOptions.y = yReduce;
    transform = isOrdinal(X) ? groupX : binX;
  } else if (xReduce != null) {
    transformOptions.x = xReduce;
    transform = isOrdinal(Y) ? groupY : binY;
  } else if (colorReduce != null || sizeReduce != null) {
    if (X && Y) {
      transform = isOrdinal(X) && isOrdinal(Y) ? group : isOrdinal(X) ? binY : isOrdinal(Y) ? binX : bin;
    } else if (X) {
      transform = isOrdinal(X) ? groupX : binX;
    } else if (Y) {
      transform = isOrdinal(Y) ? groupY : binY;
    }
  }
  if (transform) {
    if (transform === bin || transform === binX) markOptions.x = {value: X, ...xOptions};
    if (transform === bin || transform === binY) markOptions.y = {value: Y, ...yOptions};
    markOptions = transform(transformOptions, markOptions);
  }

  // If zero-ness is not specified, default based on whether the resolved mark
  // type will include a zero baseline.
  if (xZero === undefined) xZero = transform !== binX && (mark === barX || mark === areaX || mark === rectX);
  if (yZero === undefined) yZero = transform !== binY && (mark === barY || mark === areaY || mark === rectY);

  // In the case of filled marks (particularly bars and areas) the frame and
  // rules should come after the mark; in the case of stroked marks
  // (particularly dots and lines) they should come before the mark.
  const frames = fx != null || fy != null ? frame({strokeOpacity: 0.1}) : null;
  const rules = [xZero ? ruleX([0]) : null, yZero ? ruleY([0]) : null];
  mark = mark(data, markOptions);
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
// Plot.identity). We don’t apply any type inference to the fx and fy channels,
// if present, so these are simply passed-through to the underlying mark’s
// options. We don’t support reducers on the facet channels, but for symmetry
// with x and y we still allow the channels to be specified as {value} objects.
function normalizeOptions({x, y, color, size, fx, fy, mark} = {}) {
  if (!isOptions(x)) x = makeOptions(x);
  if (!isOptions(y)) y = makeOptions(y);
  if (!isOptions(color)) color = isColor(color) ? {color} : makeOptions(color);
  if (!isOptions(size)) size = makeOptions(size);
  if (isOptions(fx)) ({value: fx} = makeOptions(fx));
  if (isOptions(fy)) ({value: fy} = makeOptions(fy));
  return {x, y, color, size, fx, fy, mark};
}

// To apply heuristics based on the data types (values), realize the columns. We
// could maybe look at the data.schema here, but Plot’s behavior depends on the
// actual values anyway, so this probably is what we want.
function materializeValues(data, options) {
  const X = valueof(data, options.x.value);
  const Y = valueof(data, options.y.value);
  const C = valueof(data, options.color.value);
  const S = valueof(data, options.size.value);

  // Propagate the x and y labels (field names), if any. This is necessary for
  // any column we materialize (and hence, we don’t need to do this for fx and
  // fy, since those columns are not needed for type inference and hence are not
  // greedily materialized).
  if (X) X.label = labelof(options.x.value);
  if (Y) Y.label = labelof(options.y.value);
  if (C) C.label = labelof(options.color.value);
  if (S) S.label = labelof(options.size.value);

  return {
    ...options,
    x: {...options.x, value: X},
    y: {...options.y, value: Y},
    color: {...options.color, value: C},
    size: {...options.size, value: S}
  };
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
  if (typeof reduce?.reduce === "function" && isObject(reduce)) return true; // N.B. array.reduce
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
