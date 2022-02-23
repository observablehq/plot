import {min, max, quantile} from "d3";
import {marks} from "../plot.js";
import {groupX, groupY, groupZ} from "../transforms/group.js";
import {map} from "../transforms/map.js";
import {barX, barY} from "./bar.js";
import {dot} from "./dot.js";
import {ruleX, ruleY} from "./rule.js";
import {tickX, tickY} from "./tick.js";

// Returns a composite mark for producing a horizontal box plot, applying the
// necessary statistical transforms. The boxes are grouped by y, if present.
export function boxX(data, {
  x = {transform: x => x},
  y = null,
  fill = "#ccc",
  fillOpacity,
  stroke = "currentColor",
  strokeOpacity,
  strokeWidth = 2,
  ...options
} = {}) {
  const group = y != null ? groupY : groupZ;
  return marks(
    ruleY(data, group({x1: iqr1, x2: iqr2}, {x, y, stroke, strokeOpacity, ...options})),
    barX(data, group({x1: "p25", x2: "p75"}, {x, y, fill, fillOpacity, ...options})),
    tickX(data, group({x: "p50"}, {x, y, stroke, strokeOpacity, strokeWidth, ...options})),
    dot(data, map({x: oqr}, {x, y, z: y, stroke, strokeOpacity, ...options}))
  );
}

// Returns a composite mark for producing a vertical box plot, applying the
// necessary statistical transforms. The boxes are grouped by x, if present.
export function boxY(data, {
  y = {transform: y => y},
  x = null,
  fill = "#ccc",
  fillOpacity,
  stroke = "currentColor",
  strokeOpacity,
  strokeWidth = 2,
  ...options
} = {}) {
  const group = x != null ? groupX : groupZ;
  return marks(
    ruleX(data, group({y1: iqr1, y2: iqr2}, {x, y, stroke, strokeOpacity, ...options})),
    barY(data, group({y1: "p25", y2: "p75"}, {x, y, fill, fillOpacity, ...options})),
    tickY(data, group({y: "p50"}, {x, y, stroke, strokeOpacity, strokeWidth, ...options})),
    dot(data, map({y: oqr}, {x, y, z: x, stroke, strokeOpacity, ...options}))
  );
}

// A map function that returns only outliers, returning NaN for non-outliers
// (values within 1.5× of the interquartile range).
function oqr(values) {
  const r1 = iqr1(values);
  const r2 = iqr2(values);
  return values.map(v => v < r1 || v > r2 ? v : NaN);
}

function iqr1(values, value) {
  const lo = quartile1(values, value) * 2.5 - quartile3(values, value) * 1.5;
  return min(values, d => d >= lo ? d : NaN);
}

function iqr2(values, value) {
  const hi = quartile3(values, value) * 2.5 - quartile1(values, value) * 1.5;
  return max(values, d => d <= hi ? d : NaN);
}

function quartile1(values, value) {
  return quantile(values, 0.25, value);
}

function quartile3(values, value) {
  return quantile(values, 0.75, value);
}
