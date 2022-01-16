import {labelof, maybeValue, valueof} from "../options.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";

// TODO Allow the interval to be specified as a string, e.g. “day” or “hour”?
// This will require the interval knowing the type of the associated scale to
// chose between UTC and local time (or better, an explicit timeZone option).
function maybeInterval(interval) {
  if (interval == null) return;
  if (typeof interval === "number") {
    const n = interval;
    // Note: this offset doesn’t support the optional step argument for simplicity.
    interval = {floor: d => n * Math.floor(d / n), offset: d => d + n};
  }
  if (typeof interval.floor !== "function" || typeof interval.offset !== "function") throw new Error("invalid interval");
  return interval;
}

// The interval may be specified either as x: {value, interval} or as {x,
// interval}. The former is used, for example, for Plot.rect.
function maybeIntervalValue(value, {interval}) {
  value = {...maybeValue(value)};
  value.interval = maybeInterval(value.interval === undefined ? interval : value.interval);
  return value;
}

function maybeIntervalK(k, maybeInsetK, options) {
  const {[k]: v, [`${k}1`]: v1, [`${k}2`]: v2} = options;
  const {value, interval} = maybeIntervalValue(v, options);
  if (value == null || interval == null) return options;
  let V1;
  const tv1 = data => V1 || (V1 = valueof(data, value).map(v => interval.floor(v)));
  const label = labelof(v);
  return maybeInsetK({
    ...options,
    [k]: undefined,
    [`${k}1`]: v1 === undefined ? {transform: tv1, label} : v1,
    [`${k}2`]: v2 === undefined ? {transform: () => tv1().map(v => interval.offset(v)), label} : v2
  });
}

export function maybeIntervalX(options = {}) {
  return maybeIntervalK("x", maybeInsetX, options);
}

export function maybeIntervalY(options = {}) {
  return maybeIntervalK("y", maybeInsetY, options);
}
