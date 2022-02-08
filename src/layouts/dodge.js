import {max} from "d3";
import IntervalTree from "interval-tree-1d";
import {maybeNumberChannel} from "../options.js";
import {layout} from "./index.js";

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
  if (arguments.length === 1) [options, dodgeOptions] = [dodgeOptions, options];
  let {anchor = "left", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "left": anchor = anchorXLeft; break;
    case "right": anchor = anchorXRight; break;
    case "middle": anchor = anchorXMiddle; break;
    default: throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("x", "y", anchor, +padding, options);
}

export function dodgeY(dodgeOptions = {}, options = {}) {
  if (arguments.length === 1) [options, dodgeOptions] = [dodgeOptions, options];
  let {anchor = "bottom", padding = 1} = maybeAnchor(dodgeOptions);
  switch (`${anchor}`.toLowerCase()) {
    case "top": anchor = anchorYTop; break;
    case "bottom": anchor = anchorYBottom; break;
    case "middle": anchor = anchorYMiddle; break;
    default: throw new Error(`unknown dodge anchor: ${anchor}`);
  }
  return dodge("y", "x", anchor, +padding, options);
}

function dodge(y, x, anchor, padding, options) {
  const [, r] = maybeNumberChannel(options.r, 3);
  return layout(options, (I, scales, {[x]: X, r: R}, dimensions) => {
    if (X == null) throw new Error(`missing channel: ${x}`);
    let [ky, ty] = anchor(dimensions);
    const compare = ky ? compareAscending : compareSymmetric;
    if (ky) ty += ky * ((R ? max(I, i => R[i]) : r) + padding); else ky = 1;
    if (!R) R = new Float64Array(X.length).fill(r);
    const Y = new Float64Array(X.length);
    const tree = IntervalTree();
    for (const i of I) {
      const intervals = [];
      const l = X[i] - R[i];
      const r = X[i] + R[i];

      // For any previously placed circles that may overlap this circle, compute
      // the y-positions that place this circle tangent to these other circles.
      // https://observablehq.com/@mbostock/circle-offset-along-line
      tree.queryInterval(l - padding, r + padding, ([,, j]) => {
        const yj = Y[j];
        const dx = X[i] - X[j];
        const dr = R[i] + padding + R[j];
        const dy = Math.sqrt(dr * dr - dx * dx);
        intervals.push([yj - dy, yj + dy]);
      });

      // Find the best y-value where this circle can fit.
      for (let y of intervals.flat().sort(compare)) {
        if (intervals.every(([lo, hi]) => y <= lo || y >= hi)) {
          Y[i] = y;
          break;
        }
      }

      // Insert the placed circle into the interval tree.
      tree.insert([l, r, i]);
    }
    return {
      reindex: true,
      [x]: Float64Array.from(I, i => X[i]),
      [y]: Float64Array.from(I, i => Y[i] * ky + ty)
    };
  });
}

function compareSymmetric(a, b) {
  return Math.abs(a) - Math.abs(b);
}

function compareAscending(a, b) {
  return (a < 0) - (b < 0) || (a - b);
}
