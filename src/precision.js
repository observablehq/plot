import {tickStep, timeTickInterval, utcTickInterval} from "d3";
import {numberInterval} from "./options.js";

export function pixelRound(scale) {
  if (scale.type === "identity") return Math.round;
  if (!scale.invert) throw new Error(`Unsupported scale ${scale.type}`);
  const [d0, d1] = scale.domain();
  const r = scale.range();
  const span = Math.abs(r[1] - r[0]);
  return !span
    ? (v) => v
    : scale.type === "linear"
    ? niceRound(tickStep(0, Math.abs(d1 - d0) / span, 2))
    : scale.type === "utc" || scale.type === "time"
    ? temporalPrecision(scale, d0, d1, span)
    : (v) => niceRound(tickStep(0, Math.abs(scale.invert(scale(v) + 0.5) - v), 2))(v);
}

// Find the coarsest calendar interval whose offset spans at most 1px;
// fall back to identity for sub-millisecond domains. The multipliers
// 1, 1.5, 2, 2.5 cover the possible ratios between adjacent intervals.
function temporalPrecision(scale, d0, d1, span) {
  const tickInterval = scale.type === "utc" ? utcTickInterval : timeTickInterval;
  const p0 = scale(d0);
  for (let k = 1; k <= 2.5; k += 0.5) {
    const interval = tickInterval(d0, d1, k * span);
    if (!interval) break;
    if (Math.abs(scale(interval.offset(d0)) - p0) <= 1) return interval.round;
  }
  return (v) => v;
}

function niceRound(step) {
  const {floor} = numberInterval(step);
  return (v) => floor(+v + step / 2);
}
