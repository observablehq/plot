import {group} from "d3-array";
import {maybeZ, valueof} from "../mark.js";

export function movingAverageX(k, s) {
  return movingAverage(k, s, ["x", "x1", "x2"]);
}

export function movingAverageY(k, s) {
  return movingAverage(k, s, ["y", "y1", "y2"]);
}

// TODO allow partially-defined data
function movingAverage(k, s, keys) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  if (s === undefined) s = k >> 1;
  if (!((s = Math.floor(s)) >= 0 && s < k)) throw new Error(`invalid s: ${s}`);
  return (data, index, input) => {
    const n = data.length;
    const Z = valueof(data, maybeZ(input));
    const output = {z: Z};
    for (const key of keys) {
      const V = valueof(data, input[key], Float64Array);
      if (!V) continue;
      const M = output[key] = new Float64Array(n).fill();
      for (const facet of index) {
        for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
          let i = 0;
          let sum = 0;
          for (const n = Math.min(k - 1, I.length); i < n; ++i) {
            sum += V[I[i]];
          }
          for (const n = I.length; i < n; ++i) {
            sum += V[I[i]];
            M[I[i - s]] = sum / k;
            sum -= V[I[i - k + 1]];
          }
        }
      }
    }
    return {
      index,
      data,
      channels: output
    };
  };
}
