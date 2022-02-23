import {max} from "d3";
import IntervalTree from "interval-tree-1d";
import {layout} from "./index.js";
import {finite, positive} from "../defined.js";

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
  return layout(options, function(index, scales, values, dimensions) {
    let {[x]: X, [y]: Y, r: R} = values;
    const r = R ? undefined : this.r !== undefined ? this.r : options.r !== undefined ? +options.r : 3;
    if (X == null) throw new Error(`missing channel: ${x}`);
    let [ky, ty] = anchor(dimensions);
    const compare = ky ? compareAscending : compareSymmetric;
    if (ky) ty += ky * ((R ? max(index.flat(), i => R[i]) : r) + padding); else ky = 1;
    if (!R) R = values.r = new Float64Array(X.length).fill(r);
    if (!Y) Y = values[y] = new Float64Array(X.length);
    for (let I of index) {
      const tree = IntervalTree();
      I = I.filter(i => finite(X[i]) && positive(R[i]));
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
      for (const i of I) Y[i] = Y[i] * ky + ty;
    }
    return {index, values};
  });
}

function compareSymmetric(a, b) {
  return Math.abs(a) - Math.abs(b);
}

function compareAscending(a, b) {
  return (a < 0) - (b < 0) || (a - b);
}
