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

/** @jsdoc auto */
export function auto(data, {x, y, color, size, fx, fy, mark} = {}) {
  // Allow x and y and other dimensions to be specified as shorthand field names
  // (but note that they can also be specified as a {transform} object such as
  // Plot.identity).
  if (!isOptions(x)) x = makeOptions(x);
  if (!isOptions(y)) y = makeOptions(y);
  if (!isOptions(color)) color = isColor(color) ? {color} : makeOptions(color);
  if (!isOptions(size)) size = makeOptions(size);

  // We don’t apply any type inference to the fx and fy channels, if present, so
  // these are simply passed-through to the underlying mark’s options. We don’t
  // support reducers on the facet channels, but for symmetry with x and y we
  // still allow the channels to be specified as {value} objects.
  if (isOptions(fx)) ({value: fx} = makeOptions(fx));
  if (isOptions(fy)) ({value: fy} = makeOptions(fy));

  const {value: xValue} = x;
  const {value: yValue} = y;
  const {value: sizeValue} = size;
  const {value: colorValue, color: colorColor} = color;

  // Determine the default reducer, if any.
  let {reduce: xReduce} = x;
  let {reduce: yReduce} = y;
  let {reduce: sizeReduce} = size;
  let {reduce: colorReduce} = color;
  if (xReduce === undefined)
    xReduce = yReduce == null && xValue == null && sizeValue == null && yValue != null ? "count" : null;
  if (yReduce === undefined)
    yReduce = xReduce == null && yValue == null && sizeValue == null && xValue != null ? "count" : null;

  let {zero: xZero = isZeroReducer(xReduce) ? true : undefined} = x;
  let {zero: yZero = isZeroReducer(yReduce) ? true : undefined} = y;

  // TODO The line mark will need z?
  // TODO Limit and sort for bar charts (e.g. alphabet)?
  // TODO Look at Plot warnings and see how many we can prevent
  // TODO Default to something other than turbo for continuous? Like:
  //      scheme: (colorValue && isContinuous(color)) || colorReduce ? "ylgnbu" : undefined

  // To apply heuristics based on the data types (values), realize the columns.
  // We could maybe look at the data.schema here, but Plot’s behavior depends on
  // the actual values anyway, so this probably is what we want. By
  // materializing the columns here, we also ensure that they aren’t re-computed
  // later in Plot.plot.
  x = valueof(data, xValue);
  y = valueof(data, yValue);
  color = valueof(data, colorValue);
  size = valueof(data, sizeValue);

  // TODO Shorthand: array of primitives should result in a histogram
  if (!x && !y) throw new Error("must specify x or y");
  if (xReduce != null && !y) throw new Error("reducing x requires y");
  if (yReduce != null && !x) throw new Error("reducing y requires x");

  let z, zReduce;

  // Propagate the x and y labels (field names), if any. This is necessary for
  // any column we materialize (and hence, we don’t need to do this for fx and
  // fy, since those columns are not needed for type inference and hence are not
  // greedily materialized).
  if (x) x.label = labelof(xValue);
  if (y) y.label = labelof(yValue);
  if (color) color.label = labelof(colorValue);
  if (size) size.label = labelof(sizeValue);

  // Determine the default size reducer, if any.
  if (
    sizeReduce === undefined &&
    sizeValue == null &&
    colorReduce == null &&
    xReduce == null &&
    yReduce == null &&
    (!x || isOrdinal(x)) &&
    (!y || isOrdinal(y))
  ) {
    sizeReduce = "count";
  }

  // Determine the default mark type.
  if (mark === undefined) {
    mark =
      sizeValue != null || sizeReduce != null
        ? "dot"
        : xZero || yZero || colorReduce != null // histogram or heatmap
        ? "bar"
        : x && y
        ? isContinuous(x) && isContinuous(y) && (xReduce != null || yReduce != null || isMonotonic(x) || isMonotonic(y))
          ? "line"
          : "dot"
        : x || y
        ? "rule"
        : null;
  }

  let colorMode; // "fill" or "stroke"

  // Determine the mark implementation.
  if (mark != null) {
    switch (`${mark}`.toLowerCase()) {
      case "dot":
        mark = dot;
        colorMode = "stroke";
        break;
      case "line":
        mark = x && y ? line : x ? lineX : lineY; // 1d line by index
        colorMode = "stroke";
        if (isHighCardinality(color)) z = null; // TODO only if z not set by user
        break;
      case "area":
        mark = yZero ? areaY : xZero || (y && isMonotonic(y)) ? areaX : areaY; // favor areaY if unsure
        colorMode = "fill";
        if (isHighCardinality(color)) z = null; // TODO only if z not set by user
        break;
      case "rule":
        mark = x ? ruleX : ruleY;
        colorMode = "stroke";
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
            ? x && y && isOrdinal(x) && isOrdinal(y)
              ? cell
              : x && isOrdinal(x)
              ? barY
              : y && isOrdinal(y)
              ? barX
              : rect
            : x && y && isOrdinal(x) && isOrdinal(y)
            ? cell
            : y && isOrdinal(y)
            ? barX
            : barY;
        colorMode = "fill";
        break;
      default:
        throw new Error(`invalid mark: ${mark}`);
    }
  }

  // Determine the mark options.
  let options = {x, y, [colorMode]: color ?? colorColor, z, r: size, fx, fy};
  let transform;
  let transformOptions = {[colorMode]: colorReduce, z: zReduce, r: sizeReduce};
  if (xReduce != null && yReduce != null) {
    throw new Error(`cannot reduce both x and y`); // for now at least
  } else if (yReduce != null) {
    transformOptions.y = yReduce;
    transform = isOrdinal(x) ? groupX : binX;
  } else if (xReduce != null) {
    transformOptions.x = xReduce;
    transform = isOrdinal(y) ? groupY : binY;
  } else if (colorReduce != null || sizeReduce != null) {
    if (x && y) {
      transform = isOrdinal(x) && isOrdinal(y) ? group : isOrdinal(x) ? binY : isOrdinal(y) ? binX : bin;
    } else if (x) {
      transform = isOrdinal(x) ? groupX : binX;
    } else if (y) {
      transform = isOrdinal(y) ? groupY : binY;
    }
  }
  if (transform) options = transform(transformOptions, options);

  // If zero-ness is not specified, default based on whether the resolved mark
  // type will include a zero baseline.
  if (xZero === undefined) xZero = transform !== binX && (mark === barX || mark === areaX || mark === rectX);
  if (yZero === undefined) yZero = transform !== binY && (mark === barY || mark === areaY || mark === rectY);

  // In the case of filled marks (particularly bars and areas) the frame and
  // rules should come after the mark; in the case of stroked marks
  // (particularly dots and lines) they should come before the mark.
  const frames = fx != null || fy != null ? frame({strokeOpacity: 0.1}) : null;
  const rules = [xZero ? ruleX([0]) : null, yZero ? ruleY([0]) : null];
  mark = mark(data, options);
  return colorMode === "stroke" ? marks(frames, rules, mark) : marks(frames, mark, rules);
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

function isZeroReducer(reduce) {
  return /^(?:distinct|count|sum|proportion)$/i.test(reduce);
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
