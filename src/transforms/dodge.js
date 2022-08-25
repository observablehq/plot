import IntervalTree from "interval-tree-1d";
import {finite, positive} from "../defined.js";
import {identity, maybeNamed, number, valueof} from "../options.js";
import {coerceNumbers} from "../scales.js";
import {initializer} from "./basic.js";

const anchorXLeft = ({marginLeft}) => [1, marginLeft];
const anchorXRight = ({width, marginRight}) => [-1, width - marginRight];
const anchorXMiddle = ({width, marginLeft, marginRight}) => [0, (marginLeft + width - marginRight) / 2];
const anchorYTop = ({marginTop}) => [1, marginTop];
const anchorYBottom = ({height, marginBottom}) => [-1, height - marginBottom];
const anchorYMiddle = ({height, marginTop, marginBottom}) => [0, (marginTop + height - marginBottom) / 2];

function maybeAnchor(anchor) {
  return typeof anchor === "string" ? {anchor} : anchor;
}

/**
 * ```js
 * Plot.dodgeX({y: "value"})
 * ```
 *
 * Equivalent to Plot.dodgeY, but piling horizontally, creating a new *x*
 * position channel that avoids overlapping. The *y* position channel is
 * unchanged.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#dodge
 */
export function dodgeX(dodgeOptions = {}, options = {}) {
  if (arguments.length === 1) [dodgeOptions, options] = mergeOptions(dodgeOptions);
  let {anchor = "left", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "left":
      anchor = anchorXLeft;
      break;
    case "right":
      anchor = anchorXRight;
      break;
    case "middle":
      anchor = anchorXMiddle;
      break;
    default:
      throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("x", "y", anchor, number(padding), options);
}

/**
 * ```js
 * Plot.dodgeY({x: "date"})
 * ```
 *
 * Given marks arranged along the *x* axis, the dodgeY transform piles them
 * vertically by defining a *y* position channel that avoids overlapping. The
 * *x* position channel is unchanged.
 *
 * @link https://github.com/observablehq/plot/blob/main/README.md#dodge
 */
export function dodgeY(dodgeOptions = {}, options = {}) {
  if (arguments.length === 1) [dodgeOptions, options] = mergeOptions(dodgeOptions);
  let {anchor = "bottom", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "top":
      anchor = anchorYTop;
      break;
    case "bottom":
      anchor = anchorYBottom;
      break;
    case "middle":
      anchor = anchorYMiddle;
      break;
    default:
      throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("y", "x", anchor, number(padding), options);
}

function mergeOptions(options) {
  const {anchor, padding, ...rest} = options;
  return [{anchor, padding}, rest];
}

function dodge(y, x, anchor, padding, options) {
  const {r} = options;
  if (r != null && typeof r !== "number") {
    const {channels, sort, reverse} = options;
    options = {...options, channels: {r: {value: r, scale: "r"}, ...maybeNamed(channels)}};
    if (sort === undefined && reverse === undefined) options.sort = {channel: "r", order: "descending"};
  }
  return initializer(options, function (data, facets, {[x]: X, r: R}, scales, dimensions) {
    if (!X) throw new Error(`missing channel: ${x}`);
    X = coerceNumbers(valueof(X.value, scales[X.scale] || identity));
    const r = R ? undefined : this.r !== undefined ? this.r : options.r !== undefined ? number(options.r) : 3;
    if (R) R = coerceNumbers(valueof(R.value, scales[R.scale] || identity));
    let [ky, ty] = anchor(dimensions);
    const compare = ky ? compareAscending : compareSymmetric;
    const Y = new Float64Array(X.length);
    const radius = R ? (i) => R[i] : () => r;
    for (let I of facets) {
      const tree = IntervalTree();
      I = I.filter(R ? (i) => finite(X[i]) && positive(R[i]) : (i) => finite(X[i]));
      const intervals = new Float64Array(2 * I.length + 2);
      for (const i of I) {
        const ri = radius(i);
        const y0 = ky ? ri + padding : 0; // offset baseline for varying radius
        const l = X[i] - ri;
        const h = X[i] + ri;

        // The first two positions are 0 to test placing the dot on the baseline.
        let k = 2;

        // For any previously placed circles that may overlap this circle, compute
        // the y-positions that place this circle tangent to these other circles.
        // https://observablehq.com/@mbostock/circle-offset-along-line
        tree.queryInterval(l - padding, h + padding, ([, , j]) => {
          const yj = Y[j] - y0;
          const dx = X[i] - X[j];
          const dr = padding + (R ? R[i] + R[j] : 2 * r);
          const dy = Math.sqrt(dr * dr - dx * dx);
          intervals[k++] = yj - dy;
          intervals[k++] = yj + dy;
        });

        // Find the best y-value where this circle can fit.
        let candidates = intervals.slice(0, k);
        if (ky) candidates = candidates.filter((y) => y >= 0);
        out: for (const y of candidates.sort(compare)) {
          for (let j = 0; j < k; j += 2) {
            if (intervals[j] + 1e-6 < y && y < intervals[j + 1] - 1e-6) {
              continue out;
            }
          }
          Y[i] = y + y0;
          break;
        }

        // Insert the placed circle into the interval tree.
        tree.insert([l, h, i]);
      }
    }
    if (!ky) ky = 1;
    for (const I of facets) {
      for (const i of I) {
        Y[i] = Y[i] * ky + ty;
      }
    }
    return {
      data,
      facets,
      channels: {
        [x]: {value: X},
        [y]: {value: Y},
        ...(R && {r: {value: R}})
      }
    };
  });
}

function compareSymmetric(a, b) {
  return Math.abs(a) - Math.abs(b);
}

function compareAscending(a, b) {
  return a - b;
}
