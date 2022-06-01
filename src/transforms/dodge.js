import {max} from "d3";
import IntervalTree from "interval-tree-1d";
import {finite, positive} from "../defined.js";
import {identity, number, valueof} from "../options.js";
import {coerceNumbers} from "../scales.js";
import {initializer} from "./initializer.js";

const anchorXLeft = ({marginLeft}) => [1, marginLeft];
const anchorXRight = ({width, marginRight}) => [-1, width - marginRight];
const anchorXMiddle = ({width, marginLeft, marginRight}) => [0, (marginLeft + width - marginRight) / 2];
const anchorYTop = ({marginTop}) => [1, marginTop];
const anchorYBottom = ({height, marginBottom}) => [-1, height - marginBottom];
const anchorYMiddle = ({height, marginTop, marginBottom}) => [0, (marginTop + height - marginBottom) / 2];

function maybeAnchor(anchor) {
  return typeof anchor === "string" ? {anchor} : anchor;
}

export function dodgeX(dodgeOptions = {}, options = {}) {
  if (arguments.length === 1) ([dodgeOptions, options] = mergeOptions(dodgeOptions));
  let {anchor = "left", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "left": anchor = anchorXLeft; break;
    case "right": anchor = anchorXRight; break;
    case "middle": anchor = anchorXMiddle; break;
    default: throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("x", "y", anchor, number(padding), options);
}

export function dodgeY(dodgeOptions = {}, options = {}) {
  if (arguments.length === 1) ([dodgeOptions, options] = mergeOptions(dodgeOptions));
  let {anchor = "bottom", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "top": anchor = anchorYTop; break;
    case "bottom": anchor = anchorYBottom; break;
    case "middle": anchor = anchorYMiddle; break;
    default: throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("y", "x", anchor, number(padding), options);
}

function mergeOptions(options) {
  const {padding, ...rest} = options;
  return [{padding}, rest];
}

function dodge(y, x, anchor, padding, options) {
  const {r} = options;
  if (r != null && typeof r !== "number") {
    const {channels, sort, reverse} = options;
    options = {...options, channels: [...channels ?? [], {name: "r", value: r, scale: "r"}]};
    if (sort === undefined && reverse === undefined) options.sort = r, options.reverse = true;
  }
  return initializer(options, function(data, facets, {[x]: X, r: R}, scales, dimensions) {
    if (!X) throw new Error(`missing channel: ${x}`);
    X = coerceNumbers(valueof(X.value, scales[X.scale] || identity));
    const r = R ? undefined : this.r !== undefined ? this.r : options.r !== undefined ? number(options.r) : 3;
    if (R) R = coerceNumbers(valueof(R.value, scales[R.scale] || identity));
    let [ky, ty] = anchor(dimensions);
    const compare = ky ? compareAscending : compareSymmetric;
    if (ky) ty += ky * ((R ? max(facets, I => max(I, i => R[i])) : r) + padding); else ky = 1;
    const Y = new Float64Array(X.length);
    const radius = R ? i => R[i] : () => r;
    for (let I of facets) {
      const tree = IntervalTree();
      I = I.filter(R ? i => finite(X[i]) && positive(R[i]) : i => finite(X[i]));
      const intervals = new Float64Array(2 * I.length);
      for (const i of I) {
        const l = X[i] - radius(i);
        const h = X[i] + radius(i);

        // For any previously placed circles that may overlap this circle, compute
        // the y-positions that place this circle tangent to these other circles.
        // https://observablehq.com/@mbostock/circle-offset-along-line
        let k = 0;
        tree.queryInterval(l - padding, h + padding, ([,, j]) => {
          const yj = Y[j];
          const dx = X[i] - X[j];
          const dr = padding + (R ? R[i] + R[j] : 2 * r);
          const dy = Math.sqrt(dr * dr - dx * dx);
          intervals[k++] = yj - dy;
          intervals[k++] = yj + dy;
        });

        // Find the best y-value where this circle can fit.
        out: for (const y of intervals.slice(0, k).sort(compare)) {
          for (let j = 0; j < k; j += 2) {
            if (y > intervals[j] && y < intervals[j + 1]) {
              continue out;
            }
          }
          Y[i] = y;
          break;
        }

        // Insert the placed circle into the interval tree.
        tree.insert([l, h, i]);
      }
      for (const i of I) Y[i] = Y[i] * ky + ty;
    }
    return {data, facets, channels: {
      [x]: {value: X},
      [y]: {value: Y},
      ...R && {r: {value: R}}
    }};
  });
}

function compareSymmetric(a, b) {
  return Math.abs(a) - Math.abs(b);
}

function compareAscending(a, b) {
  return (a < 0) - (b < 0) || (a - b);
}
