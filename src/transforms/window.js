import {mapX, mapY} from "./map.js";
import {deviation, max, mean, min, sum, variance} from "d3";

export function windowX({k, reduce, shift, ...options} = {}) {
  return mapX(window(k, reduce, shift), options);
}

export function windowY({k, reduce, shift, ...options} = {}) {
  return mapY(window(k, reduce, shift), options);
}

function window(k, reduce, shift) {
  if (!((k = Math.floor(k)) > 0)) throw new Error("invalid k");
  let acceptNaN; // TODO consolidate into reducer function
  ([reduce, acceptNaN] = maybeReduce(reduce));
  shift = maybeShift(shift, k);
  return {
    map(I, S, T) {
      let v;
      const C = Float64Array.from(I, i => (v = S[i]) === +v ? v : NaN);
      const n = I.length;
      let nans = k;
      for (let i = 0; i < n; ++i) {
        if ((acceptNaN || (nans = isNaN(C[i]) ? k : nans - 1) <= 0) && i >= k - 1) {
          T[I[i - k + shift + 1]] = reduce(C.subarray(i - k + 1, i + 1));
        }
      }
    }
  };
}

function maybeShift(shift = "centered", k) {
  switch ((shift + "").toLowerCase()) {
    case "centered": return (k >> 1) + (k % 2) - 1;
    case "leading": return 0;
    case "trailing": return k - 1;
  }
  throw new Error("invalid shift");
}

function maybeReduce(reduce = "mean") {
  if (typeof reduce === "string") {
    switch (reduce.toLowerCase()) {
      case "deviation": return [deviation, false];
      case "max": return [max, false];
      case "mean": return [mean, false];
      case "min": return [min, false];
      case "sum": return [sum, false];
      case "variance": return [variance, false];
      case "difference": return [difference, true];
      case "ratio": return [ratio, true];
    }
  }
  if (typeof reduce !== "function") throw new Error("invalid reduce");
  return [reduce, true];
}

function difference(A) {
  return A[A.length - 1] - A[0];
}

function ratio(A) {
  return A[A.length - 1] / A[0];
}
