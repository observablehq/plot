import type {Interval, IntervalObject, MarkOptions} from "../api.js";
import type {DataArray, Datum, index, Value, ValueArray} from "../data.js";
import type {Accessor} from "../options.js";

import {range} from "d3";
import {isTemporal, labelof, map, maybeValue, valueof} from "../options.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";

// TODO Allow the interval to be specified as a string, e.g. “day” or “hour”?
// This will require the interval knowing the type of the associated scale to
// chose between UTC and local time (or better, an explicit timeZone option).
export function maybeInterval(interval: Interval | undefined) {
  if (interval == null) return;
  if (typeof interval === "number") {
    const n = interval;
    // Note: this offset doesn’t support the optional step argument for simplicity.
    return {
      floor: (d: number) => n * Math.floor(d / n),
      offset: (d: number) => d + n,
      range: (lo: number, hi: number) => range(Math.ceil(lo / n), hi / n).map((x) => n * x)
    };
  }
  if (typeof interval.floor !== "function" || typeof interval.offset !== "function")
    throw new Error("invalid interval; missing floor or offset function");
  return interval;
}

// The interval may be specified either as x: {value, interval} or as {x,
// interval}. The former is used, for example, for Plot.rect.
// @link https://github.com/observablehq/plot/blob/main/README.md#rect
type IntervalValue<T extends Datum> = {interval?: IntervalObject; value?: Accessor<T>};
function maybeIntervalValue<T extends Datum>(
  value: number | Accessor<T> | undefined,
  {interval}: MarkOptions<T>
): IntervalValue<T> {
  // TODO: value = {...maybeValue(value)};
  const value1 = {...(maybeValue(value) || {})};
  value1.interval = maybeInterval(value1.interval === undefined ? interval : value1.interval);
  return value1;
}

function maybeIntervalK<T extends Datum>(
  k: "x" | "y",
  maybeInsetK: (options: MarkOptions<T>) => MarkOptions<T>,
  options: MarkOptions<T>,
  trivial?: true
): MarkOptions<T> {
  const {[k]: v, [`${k}1` as "x1" | "y1"]: v1, [`${k}2` as "x2" | "y2"]: v2} = options;
  const {value, interval} = maybeIntervalValue<T>(v, options);
  if (value == null || (interval == null && !trivial)) return options;
  const label = labelof(v);
  if (interval == null) {
    let V: ValueArray | null | undefined;
    const kv = {transform: (data: DataArray<T>) => V || (V = valueof(data, value)), label};
    return {
      ...options,
      [k]: undefined,
      [`${k}1`]: v1 === undefined ? kv : v1,
      [`${k}2`]: v2 === undefined ? kv : v2
    };
  }
  let D1: DataArray<T>, V1: ValueArray;
  function transform(data: DataArray<T>) {
    if (V1 !== undefined && data === D1) return V1; // memoize
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (V1 = map(valueof((D1 = data), value!), (v: Datum) => interval!.floor(v as number)));
  }
  return maybeInsetK({
    ...options,
    [k]: undefined,
    [`${k}1`]: v1 === undefined ? {transform, label} : v1,
    [`${k}2`]:
      v2 === undefined
        ? {transform: (data: DataArray<T>) => transform(data).map((v: Datum) => interval.offset(v as number)), label}
        : v2
  });
}

function maybeIntervalMidK<T extends Datum>(
  k: "x" | "y",
  maybeInsetK: (options: MarkOptions<T>) => MarkOptions<T>,
  options: MarkOptions<T>
) {
  const {[k]: v} = options;
  const {value, interval} = maybeIntervalValue(v, options);
  if (value == null || interval == null) return options;
  return maybeInsetK({
    ...options,
    [k]: {
      label: labelof(v),
      transform: function (data: DataArray<T>) {
        // TODO: this transform can operate on numbers and Dates;
        // Here I have to type cast everything to numbers :(
        // See also type casting in map()
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        const V1 = map(valueof(data, value)!, (v: Datum) => interval.floor(v as number));
        const V2 = V1.map((v) => interval.offset(v as number));
        return V1.map(
          isTemporal(V1)
            ? (v1: Value, v2: index) =>
                v1 == null || isNaN((v1 = +v1)) || ((v2 = V2[v2]), v2 == null) || isNaN((v2 = +v2))
                  ? (undefined as unknown as number)
                  : (new Date((v1 + v2) / 2) as unknown as number)
            : (v1: Value, v2: index) => (v1 == null || ((v2 = V2[v2]), v2 == null) ? NaN : (+v1 + +v2) / 2)
        );
      }
    }
  });
}

export function maybeTrivialIntervalX<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalK("x", maybeInsetX, options, true);
}

export function maybeTrivialIntervalY<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalK("y", maybeInsetY, options, true);
}

export function maybeIntervalX<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalK("x", maybeInsetX, options);
}

export function maybeIntervalY<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalK("y", maybeInsetY, options);
}

export function maybeIntervalMidX<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalMidK("x", maybeInsetX, options);
}

export function maybeIntervalMidY<T extends Datum>(options: MarkOptions<T> = {}) {
  return maybeIntervalMidK("y", maybeInsetY, options);
}
