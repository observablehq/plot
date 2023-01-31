import {isOrdinal, labelof, valueof, isOptions} from "../options.js";
import {area, areaX, areaY} from "./area.js";
import {dot} from "./dot.js";
import {line, lineX, lineY} from "./line.js";
import {ruleX, ruleY} from "./rule.js";
import {barX, barY} from "./bar.js";
import {rect, rectX, rectY} from "./rect.js";
import {cell} from "./cell.js";
import {frame} from "./frame.js";
import {bin, binX, binY} from "../transforms/bin.js";
import {group, groupX, groupY} from "../transforms/group.js";
import {marks} from "../plot.js";
import {ascending} from "d3";

// https://github.com/observablehq/stdlib/blob/main/src/table.js
const nChecks = 20; // number of values to check in each array

export function auto(data, {x, y, fx, fy, color, size, mark} = {}) {
  // Shorthand: array of primitives should result in a histogram
  if (x === undefined && y === undefined && arrayIsPrimitive(data)) x = (d) => d;

  // Allow x and y and other dimensions to be specified as shorthand
  // field names (but note that they can also be specified as a
  // {transform} object such as Plot.identity).
  if (!isOptions(x)) x = makeOptions(x);
  if (!isOptions(y)) y = makeOptions(y);
  if (!isOptions(fx)) fx = makeOptions(fx);
  if (!isOptions(fy)) fy = makeOptions(fy);
  if (!isOptions(color)) color = makeOptions(color);
  if (!isOptions(size)) size = makeOptions(size);

  const {value: xValue} = x;
  const {value: yValue} = y;

  const {value: sizeValue, reduce: sizeReduce} = size;

  // Determine the default reducer, if any.
  let {reduce: xReduce} = x;
  let {reduce: yReduce} = y;
  if (xReduce === undefined)
    xReduce = yReduce == null && xValue == null && sizeValue == null && yValue != null ? "count" : null;
  if (yReduce === undefined)
    yReduce = xReduce == null && yValue == null && sizeValue == null && xValue != null ? "count" : null;

  const {zero: xZero} = x;
  const {zero: yZero} = y;
  const {value: colorValue, reduce: colorReduce} = color;
  const {value: fxValue} = fx;
  const {value: fyValue} = fy;

  // TODO Default sizeReduce for ordinal/ordinal case?
  // TODO Allow x: {field: "red"}, too?
  // TODO We might need maybeColorChannel to detect constant colors?
  // TODO The line mark will need z?
  // TODO Limit and sort for bar charts (e.g. alphabet)?
  // TODO Support array of primitives with no channels?
  // TODO Look at Plot warnings and see how many we can prevent
  // TODO Default to something other than turbo for continuous? Like:
  //      scheme: (colorValue && isContinuous(color)) || colorReduce ? "ylgnbu" : undefined

  // To apply heuristics based on the data types (values), realize the
  // columns. We could maybe look at the data.schema here, but Plot’s
  // behavior depends on the actual values anyway, so this probably is
  // what we want. By materializing the columns here, we also ensure
  // that they aren’t re-computed later in Plot.plot.
  x = valueof(data, xValue);
  y = valueof(data, yValue);
  color = valueof(data, colorValue);
  size = valueof(data, sizeValue);
  fx = valueof(data, fxValue); // TODO Should we still materialize if heuristic doesn't depend on it?
  fy = valueof(data, fyValue);

  // (Toph) We wanna output to these but don't allow them in API yet
  let fill, stroke, z, fillReduce, strokeReduce, zReduce;

  // Propagate the x and y labels (field names), if any.
  if (x) x.label = labelof(xValue);
  if (y) y.label = labelof(yValue);
  if (color) color.label = labelof(colorValue);
  if (size) size.label = labelof(sizeValue);

  // Determine the default mark type.
  if (mark === undefined) {
    mark =
      sizeValue != null || sizeReduce != null
        ? "dot"
        : xReduce != null || yReduce != null || colorReduce != null
        ? "bar"
        : xValue != null && yValue != null
        ? isContinuous(x) && isContinuous(y) && (isMonotonic(x) || isMonotonic(y))
          ? "line"
          : (isContinuous(x) && xZero) || (isContinuous(y) && yZero)
          ? "bar"
          : "dot"
        : xValue != null
        ? "rule"
        : yValue != null
        ? "rule"
        : null;
  }

  // Determine the mark implementation.
  if (mark != null) {
    switch (`${mark}`.toLowerCase()) {
      case "dot":
        mark = dot;
        stroke = color;
        strokeReduce = colorReduce;
        break;
      case "line":
        mark = x && y ? line : x ? lineX : lineY; // 1d line by index
        stroke = color;
        strokeReduce = colorReduce;
        if (new Set(color).size > color?.length >> 1) {
          // TODO isHighCardinality(color)
          // TODO only if z not set by user
          z = null;
        }
        break;
      case "area":
        // TODO: throw some errors; I'm not sure we ever want Plot.area; how does it work with ordinal?
        mark =
          x && y
            ? isContinuous(x) && isMonotonic(x)
              ? areaY
              : isContinuous(y) && isMonotonic(y)
              ? areaX
              : area
            : x
            ? areaX
            : areaY; // 1d area by index
        fill = color;
        fillReduce = colorReduce;
        break;
      case "rule":
        mark = x ? ruleX : ruleY;
        stroke = color;
        strokeReduce = colorReduce;
        break;
      case "bar":
        mark =
          yReduce != null
            ? isOrdinal(x)
              ? barY
              : rectY
            : xReduce != null
            ? isOrdinal(y)
              ? barX
              : rectX
            : colorReduce != null
            ? isOrdinal(x) && isOrdinal(y)
              ? cell
              : isOrdinal(x)
              ? barY
              : isOrdinal(y)
              ? barX
              : rect
            : isOrdinal(x) && isOrdinal(y)
            ? cell
            : isOrdinal(y)
            ? barX
            : barY;
        fill = color;
        fillReduce = colorReduce;
        break;
      default:
        throw new Error(`invalid mark: ${mark}`);
    }
  }

  // Determine the mark options.
  let options = {x, y, fill, stroke, z, r: size, fx, fy};
  let transformOptions = {
    fill: fillReduce,
    stroke: strokeReduce,
    z: zReduce,
    r: sizeReduce
  };
  if (xReduce != null && yReduce != null) {
    throw new Error(`cannot reduce both x and y`); // for now at least
  } else if (yReduce != null) {
    options = isOrdinal(x)
      ? groupX({y: yReduce, ...transformOptions}, options)
      : binX({y: yReduce, ...transformOptions}, options);
  } else if (xReduce != null) {
    options = isOrdinal(y)
      ? groupY({x: xReduce, ...transformOptions}, options)
      : binY({x: xReduce, ...transformOptions}, options);
  } else if (colorReduce != null || sizeReduce != null) {
    if (isOrdinal(x) && isOrdinal(y)) {
      options = group(transformOptions, options);
    } else if (!isOrdinal(x) && !isOrdinal(y)) {
      options = bin(transformOptions, options);
    } else if (isOrdinal(x) && !isOrdinal(y)) {
      options = binY(transformOptions, options); // bin y, group x
    } else if (!isOrdinal(x) && isOrdinal(y)) {
      options = binX(transformOptions, options); // bin x, group y
    }
  }

  return marks(
    // x: { zero: xZero },
    // y: { zero: yZero },
    // color: colorValue == null && colorReduce == null ? null : { legend: true },
    // marks: [
    fx || fy ? frame({stroke: "#eee"}) : null,
    xZero ? ruleX([0]) : null,
    yZero ? ruleY([0]) : null,
    mark(data, options)
    // ]
  );
}

function isContinuous(values) {
  return !isOrdinal(values);
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

function makeOptions(value) {
  return isReducer(value) ? {reduce: value} : {value};
}

// https://github.com/observablehq/stdlib/blob/main/src/table.js
function arrayIsPrimitive(value) {
  return isTypedArray(value) || arrayContainsPrimitives(value) || arrayContainsDates(value);
}

// https://github.com/observablehq/stdlib/blob/main/src/table.js
function isTypedArray(value) {
  return (
    value instanceof Int8Array ||
    value instanceof Int16Array ||
    value instanceof Int32Array ||
    value instanceof Uint8Array ||
    value instanceof Uint8ClampedArray ||
    value instanceof Uint16Array ||
    value instanceof Uint32Array ||
    value instanceof Float32Array ||
    value instanceof Float64Array
  );
}

// https://github.com/observablehq/stdlib/blob/main/src/table.js
// Given an array, checks that the first n elements are primitives (number,
// string, boolean, bigint) of a consistent type.
function arrayContainsPrimitives(value) {
  const n = Math.min(nChecks, value.length);
  if (!(n > 0)) return false;
  let type;
  let hasPrimitive = false; // ensure we encounter 1+ primitives
  for (let i = 0; i < n; ++i) {
    const v = value[i];
    if (v == null) continue; // ignore null and undefined
    const t = typeof v;
    if (type === undefined) {
      switch (t) {
        case "number":
        case "boolean":
        case "string":
        case "bigint":
          type = t;
          break;
        default:
          return false;
      }
    } else if (t !== type) {
      return false;
    }
    hasPrimitive = true;
  }
  return hasPrimitive;
}

// https://github.com/observablehq/stdlib/blob/main/src/table.js
// Given an array, checks that the first n elements are dates.
function arrayContainsDates(value) {
  const n = Math.min(nChecks, value.length);
  if (!(n > 0)) return false;
  let hasDate = false; // ensure we encounter 1+ dates
  for (let i = 0; i < n; ++i) {
    const v = value[i];
    if (v == null) continue; // ignore null and undefined
    if (!(v instanceof Date)) return false;
    hasDate = true;
  }
  return hasDate;
}

// https://github.com/observablehq/plot/blob/818562649280e155136f730fc496e0b3d15ae464/src/transforms/group.js#L236
function isReducer(reduce) {
  if (typeof reduce?.reduce === "function") return true;
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
