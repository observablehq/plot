import {mapX, mapY} from "./map.js";

export function movingAverageX({k, ...options} = {}) {
  return mapX(rollmean(k), options);
}

export function movingAverageY({k, ...options} = {}) {
  return mapY(rollmean(k), options);
}

// TODO allow partially-defined data
// TODO expose shift option (leading, trailing, centered)
// TODO rolling minimum and maximum
function rollmean(k) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  const m = k >> 1;
  return {
    map(I, S, T) {
      let i = 0;
      let sum = 0;
      for (const n = Math.min(k - 1, I.length); i < n; ++i) {
        sum += S[I[i]];
      }
      for (const n = I.length; i < n; ++i) {
        sum += S[I[i]];
        T[I[i - m]] = sum / k;
        sum -= S[I[i - k + 1]];
      }
    }
  };
}
