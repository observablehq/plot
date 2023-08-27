import {max, min, quantile, quantileSorted} from "d3";
import {marks} from "../mark.js";
import {identity} from "../options.js";
import {groupX, groupY, groupZ} from "../transforms/group.js";
import {map} from "../transforms/map.js";
import {barX, barY} from "./bar.js";
import {dot} from "./dot.js";
import {ruleX, ruleY} from "./rule.js";
import {tickX, tickY} from "./tick.js";
import {pointerX, pointerY} from "../interactions/pointer.js";
import {tip as tipmark} from "./tip.js";

// Returns a composite mark for producing a horizontal box plot, applying the
// necessary statistical transforms. The boxes are grouped by y, if present.
export function boxX(
  data,
  {
    x = identity,
    y = null,
    fill = "#ccc",
    fillOpacity,
    stroke = "currentColor",
    strokeOpacity,
    strokeWidth = 2,
    sort,
    tip,
    ...options
  } = {}
) {
  const group = y != null ? groupY : groupZ;
  return marks(
    ruleY(data, group({x1: loqr1, x2: hiqr2}, {x, y, stroke, strokeOpacity, ...options})),
    barX(data, group({x1: "p25", x2: "p75"}, {x, y, fill, fillOpacity, ...options})),
    tickX(data, group({x: "p50"}, {x, y, stroke, strokeOpacity, strokeWidth, sort, ...options})),
    dot(data, map({x: oqr}, {x, y, z: y, stroke, strokeOpacity, ...options})),
    tip && tipmark(data, pointerX(map({x: boxStats}, {x, y, z: y, ...options})))
  );
}

// Returns a composite mark for producing a vertical box plot, applying the
// necessary statistical transforms. The boxes are grouped by x, if present.
export function boxY(
  data,
  {
    y = identity,
    x = null,
    fill = "#ccc",
    fillOpacity,
    stroke = "currentColor",
    strokeOpacity,
    strokeWidth = 2,
    sort,
    tip,
    ...options
  } = {}
) {
  const group = x != null ? groupX : groupZ;
  return marks(
    ruleX(data, group({y1: loqr1, y2: hiqr2}, {x, y, stroke, strokeOpacity, ...options})),
    barY(data, group({y1: "p25", y2: "p75"}, {x, y, fill, fillOpacity, ...options})),
    tickY(data, group({y: "p50"}, {x, y, stroke, strokeOpacity, strokeWidth, sort, ...options})),
    dot(data, map({y: oqr}, {x, y, z: x, stroke, strokeOpacity, ...options})),
    tip && tipmark(data, pointerY(map({y: boxStats}, {x, y, z: x, ...options})))
  );
}

// A map function that returns only outliers, returning NaN for non-outliers
function oqr(values) {
  const r1 = loqr1(values);
  const r2 = hiqr2(values);
  return values.map((v) => (v < r1 || v > r2 ? v : NaN));
}

function loqr1(values) {
  const lo = quartile1(values) * 2.5 - quartile3(values) * 1.5;
  return min(values, (d) => (d >= lo ? d : NaN));
}

function hiqr2(values) {
  const hi = quartile3(values) * 2.5 - quartile1(values) * 1.5;
  return max(values, (d) => (d <= hi ? d : NaN));
}

function quartile1(values) {
  return quantile(values, 0.25);
}

function quartile3(values) {
  return quantile(values, 0.75);
}

function boxStats(values) {
  const V = Float64Array.from(
    (function* (V) {
      for (let v of V) if (v !== null && !isNaN((v = +v))) yield v;
    })(values)
  ).sort();
  const q1 = quantileSorted(V, 0.25);
  const mi = quantileSorted(V, 0.5);
  const q3 = quantileSorted(V, 0.75);
  const lo = q1 * 2.5 - q3 * 1.5;
  const loqr1 = V.find((d) => d >= lo);
  const hi = q3 * 2.5 - q1 * 1.5;
  let hiqr2;
  for (let i = V.length - 1; i >= 0; --i) {
    if (V[i] <= hi) {
      hiqr2 = V[i];
      break;
    }
  }
  const report = [q3, q1, mi, hiqr2, loqr1];
  return values.map((d) => (d < loqr1 || d > hiqr2 ? d : report.pop() ?? NaN));
}
