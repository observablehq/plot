import {mapi} from "./map.js";

export function movingAverageX(options) {
  const map = movingAverage(options);
  return mapi([["x", map], ["x1", map], ["x2", map]], options);
}

export function movingAverageY(options) {
  const map = movingAverage(options);
  return mapi([["y", map], ["y1", map], ["y2", map]], options);
}

// TODO allow partially-defined data
// TODO expose shift option (leading, trailing, centered)
// TODO rolling minimum and maximum
function movingAverage({k} = {}) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  const m = k >> 1;
  return (I, S, T) => {
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
  };
}
