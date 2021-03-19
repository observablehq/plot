import {mapX, mapY} from "./map.js";
import {deviation, max, mean, min, sum, variance} from "d3";

export function windowX({k, reduce, shift, ...options} = {}) {
  return mapX(roll(k, reduce, shift), options);
}

export function windowY({k, reduce, shift, ...options} = {}) {
  return mapY(roll(k, reduce, shift), options);
}

function roll(k, reduce = "mean", shift = "centered") {
  let acceptnans = true;
  if (typeof reduce === "string") {
    switch (reduce.toLowerCase()) {
      case "deviation": reduce = deviation; acceptnans = false; break;
      case "max": reduce = max; acceptnans = false; break;
      case "mean": reduce = mean; acceptnans = false; break;
      case "min": reduce = min; acceptnans = false; break;
      case "sum": reduce = sum; acceptnans = false; break;
      case "variance": reduce = variance; acceptnans = false; break;
      case "difference": reduce = difference; break;
      case "ratio": reduce = ratio; break;
    }
  }
  if (typeof reduce !== "function") throw new Error(`invalid reduce: ${reduce}`);
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  shift = shift.toLowerCase();
  const m1 = shift === "leading" ? 0
           : shift === "trailing" ? k - 1
           : (k >> 1) + (k % 2) - 1;
  return {
    map(I, S, T) {
      let v;
      const C = Float64Array.from(I, i => (v = S[i]) === +v ? v : NaN);
      const n = I.length;
      let nans = k;
      for (let i = 0; i < n; ++i) {
        if ((acceptnans || (nans = isNaN(C[i]) ? k : nans - 1) <= 0) && i >= k - 1) {
          T[I[i - k + m1 + 1]] = reduce(C.subarray(i - k + 1, i + 1));
        }
      }
    }
  };
  
  function difference(A) {
    return A[A.length - 1] - A[0];
  }

  function ratio(A) {
    return A[A.length - 1] / A[0];
  }
}
