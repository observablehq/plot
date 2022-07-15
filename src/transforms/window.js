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
  let {k, reduce, shift, anchor, strict} = options;
  if (anchor === undefined && shift !== undefined) {
    anchor = maybeShift(shift);
    warn(`Warning: the shift option is deprecated; please use anchor "${anchor}" instead.`);
  }
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  return maybeReduce(reduce)(k, maybeAnchor(anchor, k), strict);
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

// Note that the subarray may contain NaN even in the strict case; we expect the
// function f to handle that itself (e.g., by filtering as needed). The D3
// reducers (e.g., min, max, mean, median) already handle NaN input, so it’s
// faster to avoid redundant filtering.
function reduceSubarray(f) {
  return (k, s, strict) => strict ? ({
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
  }) : ({
    map(I, S, T) {
      const C = Float64Array.from(I, i => S[i] === null ? NaN : S[i]);
      for (let i = -s; i < 0; ++i) {
        T[I[i + s]] = f(C.subarray(0, i + k));
      }
      for (let i = 0, n = I.length - s; i < n; ++i) {
        T[I[i + s]] = f(C.subarray(i, i + k));
      }
    }
  });
}

function reduceSum(k, s, strict) {
  return strict ? ({
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
  }) : ({
    map(I, S, T) {
      let sum = 0;
      const n = I.length;
      for (let i = 0, j = Math.min(n, k - s - 1); i < j; ++i) {
        sum += +S[I[i]] || 0;
      }
      for (let i = -s, j = n - s; i < j; ++i) {
        sum += +S[I[i + k - 1]] || 0;
        T[I[i + s]] = sum;
        sum -= +S[I[i]] || 0;
      }
    }
  });
}

function reduceMean(k, s, strict) {
  if (strict) {
    const sum = reduceSum(k, s, strict);
    return {
      map(I, S, T) {
        sum.map(I, S, T);
        for (let i = 0, n = I.length - k + 1; i < n; ++i) {
          T[I[i + s]] /= k;
        }
      }
    };
  } else {
    return {
      map(I, S, T) {
        let sum = 0;
        let count = 0;
        const n = I.length;
        for (let i = 0, j = Math.min(n, k - s - 1); i < j; ++i) {
          let v = S[I[i]];
          if (v !== null && !isNaN(v = +v)) sum += v, ++count;
        }
        for (let i = -s, j = n - s; i < j; ++i) {
          let a = S[I[i + k - 1]];
          let b = S[I[i]];
          if (a !== null && !isNaN(a = +a)) sum += a, ++count;
          T[I[i + s]] = sum / count;
          if (b !== null && !isNaN(b = +b)) sum -= b, --count;
        }
      }
    };
  }
}

// TODO implement non-strict
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

// TODO implement non-strict
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

// TODO implement non-strict
function reduceFirst(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        T[I[i + s]] = S[I[i]];
      }
    }
  };
}

// TODO implement non-strict
function reduceLast(k, s) {
  return {
    map(I, S, T) {
      for (let i = 0, n = I.length - k; i < n; ++i) {
        T[I[i + s]] = S[I[i + k - 1]];
      }
    }
  };
}
