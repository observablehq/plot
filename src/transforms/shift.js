import {max, min} from "d3";
import {maybeInterval} from "../options.js";
import {parseTimeInterval} from "../time.js";
import {map} from "../transforms/map.js";

export function shiftX(interval, options) {
  return shiftK("x", interval, options);
}

function shiftK(x, interval, options = {}) {
  let offset;
  let k = 1;
  if (typeof interval === "number") {
    k = interval;
    offset = (x, k) => +x + k;
  } else {
    if (typeof interval === "string") {
      const sign = interval.startsWith("-") ? -1 : 1;
      [interval, k] = parseTimeInterval(interval.replace(/^[+-]/, ""));
      k *= sign;
    }
    interval = maybeInterval(interval);
    offset = (x, k) => interval.offset(x, k);
  }
  return map(
    k < 1
      ? {
          [`${x}1`](D) {
            const start = offset(min(D), -k);
            return D.map((d) => (d < start ? null : offset(d, k)));
          },
          [`${x}2`](D) {
            const end = offset(max(D), k);
            return D.map((d) => (end < d ? null : d));
          }
        }
      : {
          [`${x}1`](D) {
            const end = offset(max(D), -k);
            return D.map((d) => (end < d ? null : offset(d, k)));
          },
          [`${x}2`](D) {
            const start = offset(min(D), k);
            return D.map((d) => (d < start ? null : d));
          }
        },
    options
  );
}
