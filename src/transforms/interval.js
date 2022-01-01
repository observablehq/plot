import {isTemporal, labelof, maybeValue, valueof} from "../mark.js";
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
  let D1, V1;
  const label = labelof(v);
  function transform(data) {
    if (V1 !== undefined && data === D1) return V1; // memoize
    return V1 = Array.from(valueof(D1 = data, value), v => interval.floor(v));
  }
  return maybeInsetK({
    ...options,
    [k]: undefined,
    [`${k}1`]: v1 === undefined ? {transform, label} : v1,
    [`${k}2`]: v2 === undefined ? {transform: data => transform(data).map(v => interval.offset(v)), label} : v2
  });
}

function maybeIntervalMidK(k, maybeInsetK, options) {
  const {[k]: v} = options;
  const {value, interval} = maybeIntervalValue(v, options);
  if (value == null || interval == null) return options;
  return maybeInsetK({
    ...options,
    [k]: {
      label: labelof(v),
      transform: data => {
        const V1 = Array.from(valueof(data, value), v => interval.floor(v));
        const V2 = V1.map(v => interval.offset(v));
        return V1.map(isTemporal(V1)
          ? (v1, v2) => v1 == null || isNaN(v1 = +v1) || (v2 = V2[v2], v2 == null) || isNaN(v2 = +v2) ? undefined : new Date((v1 + v2) / 2)
          : (v1, v2) => v1 == null || (v2 = V2[v2], v2 == null) ? NaN : (+v1 + +v2) / 2);
      }
    }
  });
}

export function maybeIntervalX(options = {}) {
  return maybeIntervalK("x", maybeInsetX, options);
}

export function maybeIntervalY(options = {}) {
  return maybeIntervalK("y", maybeInsetY, options);
}

export function maybeIntervalMidX(options = {}) {
  return maybeIntervalMidK("x", maybeInsetX, options);
}

export function maybeIntervalMidY(options = {}) {
  return maybeIntervalMidK("y", maybeInsetY, options);
}
