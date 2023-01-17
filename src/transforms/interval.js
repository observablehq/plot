import {isTemporal, labelof, map, maybeInterval, maybeValue, valueof} from "../options.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";

// The interval may be specified either as x: {value, interval} or as {x,
// interval}. The former can be used to specify separate intervals for x and y,
// for example with Plot.rect.
function maybeIntervalValue(value, {interval}) {
  value = {...maybeValue(value)};
  value.interval = maybeInterval(value.interval === undefined ? interval : value.interval);
  return value;
}

function maybeIntervalK(k, maybeInsetK, options, trivial) {
  const {[k]: v, [`${k}1`]: v1, [`${k}2`]: v2} = options;
  const {value, interval} = maybeIntervalValue(v, options);
  if (value == null || (interval == null && !trivial)) return options;
  const label = labelof(v);
  if (interval == null) {
    let V;
    const kv = {transform: (data) => V || (V = valueof(data, value)), label};
    return {
      ...options,
      [k]: undefined,
      [`${k}1`]: v1 === undefined ? kv : v1,
      [`${k}2`]: v2 === undefined ? kv : v2
    };
  }
  let D1, V1;
  function transform(data) {
    if (V1 !== undefined && data === D1) return V1; // memoize
    return (V1 = map(valueof((D1 = data), value), (v) => interval.floor(v)));
  }
  return maybeInsetK({
    ...options,
    [k]: undefined,
    [`${k}1`]: v1 === undefined ? {transform, label} : v1,
    [`${k}2`]: v2 === undefined ? {transform: (data) => transform(data).map((v) => interval.offset(v)), label} : v2
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
      transform: (data) => {
        const V1 = map(valueof(data, value), (v) => interval.floor(v));
        const V2 = V1.map((v) => interval.offset(v));
        return V1.map(
          isTemporal(V1)
            ? (v1, v2) =>
                v1 == null || isNaN((v1 = +v1)) || ((v2 = V2[v2]), v2 == null) || isNaN((v2 = +v2))
                  ? undefined
                  : new Date((v1 + v2) / 2)
            : (v1, v2) => (v1 == null || ((v2 = V2[v2]), v2 == null) ? NaN : (+v1 + +v2) / 2)
        );
      }
    }
  });
}

export function maybeTrivialIntervalX(options = {}) {
  return maybeIntervalK("x", maybeInsetX, options, true);
}

export function maybeTrivialIntervalY(options = {}) {
  return maybeIntervalK("y", maybeInsetY, options, true);
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
