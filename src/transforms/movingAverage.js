import {mapX, mapY} from "./map.js";
import {max, mean, min} from "d3";

export function movingAverageX({k, shift, ...options} = {}) {
  return mapX(roll(k, meanDefined, shift), options);
}

export function movingAverageY({k, shift, ...options} = {}) {
  return mapY(roll(k, meanDefined, shift), options);
}

export function movingMaxX({k, shift, ...options} = {}) {
  return mapX(roll(k, max, shift, true), options);
}

export function movingMaxY({k, shift, ...options} = {}) {
  return mapY(roll(k, max, shift, true), options);
}

export function movingMinX({k, shift, ...options} = {}) {
  return mapX(roll(k, min, shift, true), options);
}

export function movingMinY({k, shift, ...options} = {}) {
  return mapY(roll(k, min, shift, true), options);
}

function meanDefined(d) {
  return d.some(isNaN) ? undefined : mean(d);
}

function roll(k, f, shift = "centered", fill) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  shift = shift.toLowerCase();
  const m1 = shift === "leading" ? 1
           : shift === "trailing" ? k
           : (k >> 1) + (k % 2);
  return {
    map(I, S, T) {
      const C = new Float64Array(k).fill(NaN);
      const n = I.length;
      for (let i = 0; i < n; ++i) {
        const v = S[I[i]];
        C[i % k] = (v === +v) ? v : NaN;
        const j = i - k;
        if (j >= -1) {
          const w = f(C);
          if (w !== undefined) {
            T[I[j + m1]] = w;
          }
        }
      }
      if (fill) {
        for (let j = 0; j < m1 - 1; j++) T[I[j]] = T[I[m1 - 1]];
        for (let j = n - k + m1; j < n; j++) T[I[j]] = T[I[n - 1 - k + m1]];
      }
    }
  };
}
