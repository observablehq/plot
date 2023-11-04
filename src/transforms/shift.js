import {extent} from "d3";
import {maybeInterval} from "../options.js";
import {parseTimeInterval} from "../time.js";
import {map} from "../transforms/map.js";
import {basic} from "./basic.js";

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
  let V;
  return basic(
    map(
      {
        [`${x}1`]: (D) => (V = D).map((d) => offset(d, k)),
        [`${x}2`]: (D) => D
      },
      options
    ),
    function (data, facets) {
      const {[`${x}1`]: channel} = this.channels;
      if (channel) {
        channel.hint = {
          get domain() {
            const [x0, x1] = extent(V);
            return k < 0 ? [x0, offset(x1, k)] : [offset(x0, k), x1];
          }
        };
      }
      return {data, facets};
    }
  );
}
