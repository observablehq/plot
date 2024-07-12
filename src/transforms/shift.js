import {extent} from "d3";
import {maybeInterval} from "../options.js";
import {parseTimeInterval} from "../time.js";
import {map} from "../transforms/map.js";

export function shiftX(interval, options) {
  return shiftK("x", interval, options);
}

export function shiftY(interval, options) {
  return shiftK("y", interval, options);
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
  const x1 = `${x}1`;
  const x2 = `${x}2`;
  const mapped = map(
    {
      [x1]: (D) => D.map((d) => offset(d, k)),
      [x2]: (D) => D
    },
    options
  );
  const t = mapped[x2].transform;
  mapped[x2].transform = () => {
    const V = t();
    const [x0, x1] = extent(V);
    V.domain = k < 0 ? [x0, offset(x1, k)] : [offset(x0, k), x1];
    return V;
  };
  return mapped;
}
