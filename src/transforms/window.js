import {mapX, mapY} from "./map.js";
import {max, mean, min} from "d3";

export function windowX({k, reduce, shift, ...options} = {}) {
  return mapX(roll(k, reduce, shift), options);
}

export function windowY({k, reduce, shift, ...options} = {}) {
  return mapY(roll(k, reduce, shift), options);
}

function roll(k, reduce = "mean", shift = "centered") {
  switch (reduce) {
    case "max": reduce = max; break;
    case "mean": reduce = mean; break;
    case "min": reduce = min; break;
  }
  if (typeof reduce !== "function") throw new Error(`invalid reduce: ${reduce}`);
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  shift = shift.toLowerCase();
  const m1 = shift === "leading" ? 1
           : shift === "trailing" ? k
           : (k >> 1) + (k % 2);
  return {
    map(I, S, T) {
      const C = new Float64Array(k).fill(NaN);
      let nans = k;
      const n = I.length;
      for (let i = 0; i < n; ++i) {
        const v = C[i % k] = S[I[i]];
        if (v === +v) {
          nans--;
        } else {
          nans = k;
        }
        if (nans <= 0) {
          const j = i - k;
          if (j >= -1) {
            T[I[j + m1]] = reduce(C);
          }
        }
      }
    }
  };
}
