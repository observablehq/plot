import {InternSet} from "d3";
import {isOrdinal, labelof, valueof, isOptions, identity, isColor} from "../options.js";
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
import {marks} from "../mark.js";
import {ascending} from "d3";

export function auto(data, {x, y, fx, fy, color, size, mark} = {}) {
  // Shorthand: array of primitives should result in a histogram
  if (x === undefined && y === undefined) x = identity;

  // Allow x and y and other dimensions to be specified as shorthand field names
  // (but note that they can also be specified as a {transform} object such as
  // Plot.identity).
  if (!isOptions(x)) x = makeOptions(x);
  if (!isOptions(y)) y = makeOptions(y);
  if (!isOptions(fx)) fx = makeOptions(fx);
  if (!isOptions(fy)) fy = makeOptions(fy);
  if (!isOptions(color)) color = isColor(color) ? {color} : makeOptions(color);
  if (!isOptions(size)) size = makeOptions(size);

  const {value: xValue} = x;
  const {value: yValue} = y;
  const {value: sizeValue} = size;

  // Determine the default reducer, if any.
  let {reduce: xReduce} = x;
  let {reduce: yReduce} = y;
  let {reduce: sizeReduce} = size;
  if (xReduce === undefined)
    xReduce = yReduce == null && xValue == null && sizeValue == null && yValue != null ? "count" : null;
  if (yReduce === undefined)
    yReduce = xReduce == null && yValue == null && sizeValue == null && xValue != null ? "count" : null;

  let {zero: xZero} = x;
  let {zero: yZero} = y;
  const {value: colorValue, reduce: colorReduce, color: colorColor} = color;
  const {value: fxValue} = fx;
  const {value: fyValue} = fy;

  // TODO Default sizeReduce for ordinal/ordinal case?
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
  fx = valueof(data, fxValue); // TODO Should we still materialize if heuristic doesn't depend on it?
  fy = valueof(data, fyValue);

  let z, zReduce;

  // Propagate the x and y labels (field names), if any.
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
        mark =
          x && y
            ? isContinuous(x) && isMonotonic(x)
              ? areaY
              : isContinuous(y) && isMonotonic(y)
              ? areaX
              : area // TODO error? how does it work with ordinal?
            : x
            ? areaX
            : areaY; // 1d area by index
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
  const frames = fx || fy ? frame({strokeOpacity: 0.1}) : null;
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

function isHighCardinality(value) {
  return value ? new InternSet(value).size > value.length >> 1 : false;
}
