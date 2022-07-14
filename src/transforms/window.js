import {mapX, mapY} from "./map.js";
import {deviation, max, min, median, mode, variance} from "d3";
import {warn} from "../warnings.js";
import {percentile} from "../options.js";

export function windowX(windowOptions = {}, options) {
  if (arguments.length === 1) options = windowOptions;
  return mapX(window(windowOptions), options);
}

export function windowY(windowOptions = {}, options) {
  if (arguments.length === 1) options = windowOptions;
  return mapY(window(windowOptions), options);
}

export function window(options = {}) {
  if (typeof options === "number") options = {k: options};
  let {k, reduce, shift, anchor, extend} = options;
  if (anchor === undefined && shift !== undefined) {
    anchor = maybeShift(shift);
    warn(`Warning: the shift option is deprecated; please use anchor "${anchor}" instead.`);
  }
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  const r = maybeReduce(reduce);
  const s = maybeAnchor(anchor, k);
  return (extend ? extendReducer(r) : r)(k, s);
}

function maybeAnchor(anchor = "middle", k) {
  switch (`${anchor}`.toLowerCase()) {
    case "middle": return (k - 1) >> 1;
    case "start": return 0;
    case "end": return k - 1;
  }
  throw new Error(`invalid anchor: ${anchor}`);
}

function maybeShift(shift) {
  switch (`${shift}`.toLowerCase()) {
    case "centered": return "middle";
    case "leading": return "start";
    case "trailing": return "end";
  }
  throw new Error(`invalid shift: ${shift}`);
}

function maybeReduce(reduce = "mean") {
  if (typeof reduce === "string") {
    if (/^p\d{2}$/i.test(reduce)) return reduceSubarray(percentile(reduce));
    switch (reduce.toLowerCase()) {
      case "deviation": return reduceSubarray(deviation);
      case "max": return reduceSubarray(max);
      case "mean": return reduceMean;
      case "median": return reduceSubarray(median);
      case "min": return reduceSubarray(min);
      case "mode": return reduceSubarray(mode);
      case "sum": return reduceSum;
      case "variance": return reduceSubarray(variance);
      case "difference": return reduceDifference;
      case "ratio": return reduceRatio;
      case "first": return reduceFirst;
      case "last": return reduceLast;
    }
  }
  if (typeof reduce !== "function") throw new Error(`invalid reduce: ${reduce}`);
  return reduceSubarray(reduce);
}

function extendReducer(reducer) {
  return (k, s) => {
    const reduce = reducer(k, s);
    return {
      map(I, S, T) {
        const n = I.length;
        reduce.map(I, S, T);
        for (let i = 0; i < s; ++i) {
          const j = Math.min(n, i + k - s);
          reducer(j, i).map(I.subarray(0, j), S, T);
        }
        for (let i = n - k + s + 1; i < n; ++i) {
          const j = Math.max(0, i - s);
          reducer(n - j, i - j).map(I.subarray(j, n), S, T);
        }
      }
    };
  };
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

function reduceFirst(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        T[I[i + s]] = S[I[i]];
      }
    }
  };
}

function reduceLast(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        T[I[i + s]] = S[I[i + k - 1]];
      }
    }
  };
}
