import {mapX, mapY} from "./map.js";
import {deviation, max, min, median, variance} from "d3";

export function windowX({k, reduce, shift, ...options} = {}) {
  return mapX(window(k, reduce, shift), options);
}

export function windowY({k, reduce, shift, ...options} = {}) {
  return mapY(window(k, reduce, shift), options);
}

function window(k, reduce, shift) {
  if (!((k = Math.floor(k)) > 0)) throw new Error("invalid k");
  return maybeReduce(reduce)(k, maybeShift(shift, k));
}

// TODO rename to anchor = {start, center, end}?
function maybeShift(shift = "centered", k) {
  switch ((shift + "").toLowerCase()) {
    case "centered": return (k - 1) >> 1;
    case "leading": return 0;
    case "trailing": return k - 1;
  }
  throw new Error("invalid shift");
}

function maybeReduce(reduce = "mean") {
  if (typeof reduce === "string") {
    switch (reduce.toLowerCase()) {
      case "deviation": return reduceSubarray(deviation);
      case "max": return reduceSubarray(max);
      case "mean": return reduceMean;
      case "median": return reduceSubarray(median);
      case "min": return reduceSubarray(min);
      case "sum": return reduceSum;
      case "variance": return reduceSubarray(variance);
      case "difference": return reduceDifference;
      case "ratio": return reduceRatio;
    }
  }
  if (typeof reduce !== "function") throw new Error("invalid reduce");
  return reduceSubarray(reduce);
}

function reduceSubarray(f) {
  return (k, s) => ({
    map(I, S, T) {
      const C = Float64Array.from(I, i => S[i] === null ? NaN : S[i]);
      let nans = 0;
      for (let i = 0; i < k - 1; ++i) if (isNaN(C[i])) ++nans;
      for (let i = 0, n = I.length - k + 1; i < n; ++i) {
        if (isNaN(C[i + k - 1])) ++nans;
        T[I[i + s]] = nans === 0 ? f(C.subarray(i, i + k)) : NaN;
        if (isNaN(C[i])) --nans;
      }
    }
  });
}

function reduceSum(k, s) {
  return {
    map(I, S, T) {
      let nans = 0;
      let sum = 0;
      for (let i = 0; i < k - 1; ++i) {
        const v = S[I[i]];
        if (v === null || isNaN(v)) ++nans;
        else sum += +v;
      }
      for (let i = 0, n = I.length - k + 1; i < n; ++i) {
        const a = S[I[i]];
        const b = S[I[i + k - 1]];
        if (b === null || isNaN(b)) ++nans;
        else sum += +b;
        T[I[i + s]] = nans === 0 ? sum : NaN;
        if (a === null || isNaN(a)) --nans;
        else sum -= +a;
      }
    }
  };
}

function reduceMean(k, s) {
  const sum = reduceSum(k, s);
  return {
    map(I, S, T) {
      sum.map(I, S, T);
      for (let i = 0, n = I.length - k + 1; i < n; ++i) {
        T[I[i + s]] /= k;
      }
    }
  };
}

function reduceDifference(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        const a = S[I[i]];
        const b = S[I[i + k - 1]];
        T[I[i + s]] = a === null || b === null ? NaN : b - a;
      }
    }
  };
}

function reduceRatio(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        const a = S[I[i]];
        const b = S[I[i + k - 1]];
        T[I[i + s]] = a === null || b === null ? NaN : b / a;
      }
    }
  };
}
