import {mapX, mapY} from "./map.js";
import {max, mean, min} from "d3";

export function movingAverageX({k, shift, ...options} = {}) {
  return mapX(roll(k, mean, shift), options);
}

export function movingAverageY({k, shift, ...options} = {}) {
  return mapY(roll(k, mean, shift), options);
}

export function movingMaxX({k, shift, ...options} = {}) {
  return mapX(roll(k, max, shift), options);
}

export function movingMaxY({k, shift, ...options} = {}) {
  return mapY(roll(k, max, shift), options);
}

export function movingMinX({k, shift, ...options} = {}) {
  return mapX(roll(k, min, shift), options);
}

export function movingMinY({k, shift, ...options} = {}) {
  return mapY(roll(k, min, shift), options);
}

function roll(k, f, shift = "centered") {
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
            T[I[j + m1]] = f(C);
          }
        }
      }
    }
  };
}
