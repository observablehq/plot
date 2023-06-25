import {deviation, max, median, min, mode, variance} from "d3";
import {defined} from "../defined.js";
import {percentile, subarray, taker} from "../options.js";
import {warn} from "../warnings.js";
import {mapX, mapY} from "./map.js";

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
    case "middle":
      return (k - 1) >> 1;
    case "start":
      return 0;
    case "end":
      return k - 1;
  }
  throw new Error(`invalid anchor: ${anchor}`);
}

function maybeShift(shift) {
  switch (`${shift}`.toLowerCase()) {
    case "centered":
      return "middle";
    case "leading":
      return "start";
    case "trailing":
      return "end";
  }
  throw new Error(`invalid shift: ${shift}`);
}

function maybeReduce(reduce = "mean") {
  if (typeof reduce === "string") {
    if (/^p\d{2}$/i.test(reduce)) return reduceAccessor(percentile(reduce));
    switch (reduce.toLowerCase()) {
      case "deviation":
        return reduceAccessor(deviation);
      case "max":
        return reduceArray((I, V) => max(I, (i) => V[i]));
      case "mean":
        return reduceMean;
      case "median":
        return reduceAccessor(median);
      case "min":
        return reduceArray((I, V) => min(I, (i) => V[i]));
      case "mode":
        return reduceArray((I, V) => mode(I, (i) => V[i]));
      case "sum":
        return reduceSum;
      case "variance":
        return reduceAccessor(variance);
      case "difference":
        return reduceDifference;
      case "ratio":
        return reduceRatio;
      case "first":
        return reduceFirst;
      case "last":
        return reduceLast;
    }
  }
  if (typeof reduce !== "function") throw new Error(`invalid reduce: ${reduce}`);
  return reduceArray(taker(reduce));
}

// Note that the subarray may include NaN in the non-strict case; we expect the
// function f to handle that itself (e.g., by filtering as needed). The D3
// reducers (e.g., min, max, mean, median) do, and it’s faster to avoid
// redundant filtering.
function reduceAccessor(f) {
  return (k, s, strict) =>
    strict
      ? {
          mapIndex(I, S, T) {
            const v = (i) => (S[i] == null ? NaN : +S[i]);
            let nans = 0;
            for (let i = 0; i < k - 1; ++i) if (isNaN(v(i))) ++nans;
            for (let i = 0, n = I.length - k + 1; i < n; ++i) {
              if (isNaN(v(i + k - 1))) ++nans;
              T[I[i + s]] = nans === 0 ? f(subarray(I, i, i + k), v) : NaN;
              if (isNaN(v(i))) --nans;
            }
          }
        }
      : {
          mapIndex(I, S, T) {
            const v = (i) => (S[i] == null ? NaN : +S[i]);
            for (let i = -s; i < 0; ++i) {
              T[I[i + s]] = f(subarray(I, 0, i + k), v);
            }
            for (let i = 0, n = I.length - s; i < n; ++i) {
              T[I[i + s]] = f(subarray(I, i, i + k), v);
            }
          }
        };
}

function reduceArray(f) {
  return (k, s, strict) =>
    strict
      ? {
          mapIndex(I, S, T) {
            let count = 0;
            for (let i = 0; i < k - 1; ++i) count += defined(S[I[i]]);
            for (let i = 0, n = I.length - k + 1; i < n; ++i) {
              count += defined(S[I[i + k - 1]]);
              if (count === k) T[I[i + s]] = f(subarray(I, i, i + k), S);
              count -= defined(S[I[i]]);
            }
          }
        }
      : {
          mapIndex(I, S, T) {
            for (let i = -s; i < 0; ++i) {
              T[I[i + s]] = f(subarray(I, 0, i + k), S);
            }
            for (let i = 0, n = I.length - s; i < n; ++i) {
              T[I[i + s]] = f(subarray(I, i, i + k), S);
            }
          }
        };
}

function reduceSum(k, s, strict) {
  return strict
    ? {
        mapIndex(I, S, T) {
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
      }
    : {
        mapIndex(I, S, T) {
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
      };
}

function reduceMean(k, s, strict) {
  if (strict) {
    const sum = reduceSum(k, s, strict);
    return {
      mapIndex(I, S, T) {
        sum.mapIndex(I, S, T);
        for (let i = 0, n = I.length - k + 1; i < n; ++i) {
          T[I[i + s]] /= k;
        }
      }
    };
  } else {
    return {
      mapIndex(I, S, T) {
        let sum = 0;
        let count = 0;
        const n = I.length;
        for (let i = 0, j = Math.min(n, k - s - 1); i < j; ++i) {
          let v = S[I[i]];
          if (v !== null && !isNaN((v = +v))) (sum += v), ++count;
        }
        for (let i = -s, j = n - s; i < j; ++i) {
          let a = S[I[i + k - 1]];
          let b = S[I[i]];
          if (a !== null && !isNaN((a = +a))) (sum += a), ++count;
          T[I[i + s]] = sum / count;
          if (b !== null && !isNaN((b = +b))) (sum -= b), --count;
        }
      }
    };
  }
}

function firstDefined(S, I, i, k) {
  for (let j = i + k; i < j; ++i) {
    const v = S[I[i]];
    if (defined(v)) return v;
  }
}

function lastDefined(S, I, i, k) {
  for (let j = i + k - 1; j >= i; --j) {
    const v = S[I[j]];
    if (defined(v)) return v;
  }
}

function firstNumber(S, I, i, k) {
  for (let j = i + k; i < j; ++i) {
    let v = S[I[i]];
    if (v !== null && !isNaN((v = +v))) return v;
  }
}

function lastNumber(S, I, i, k) {
  for (let j = i + k - 1; j >= i; --j) {
    let v = S[I[j]];
    if (v !== null && !isNaN((v = +v))) return v;
  }
}

function reduceDifference(k, s, strict) {
  return strict
    ? {
        mapIndex(I, S, T) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            const a = S[I[i]];
            const b = S[I[i + k - 1]];
            T[I[i + s]] = a === null || b === null ? NaN : b - a;
          }
        }
      }
    : {
        mapIndex(I, S, T) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = lastNumber(S, I, i, k) - firstNumber(S, I, i, k);
          }
        }
      };
}

function reduceRatio(k, s, strict) {
  return strict
    ? {
        mapIndex(I, S, T) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            const a = S[I[i]];
            const b = S[I[i + k - 1]];
            T[I[i + s]] = a === null || b === null ? NaN : b / a;
          }
        }
      }
    : {
        mapIndex(I, S, T) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = lastNumber(S, I, i, k) / firstNumber(S, I, i, k);
          }
        }
      };
}

function reduceFirst(k, s, strict) {
  return strict
    ? {
        mapIndex(I, S, T) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            T[I[i + s]] = S[I[i]];
          }
        }
      }
    : {
        mapIndex(I, S, T) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = firstDefined(S, I, i, k);
          }
        }
      };
}

function reduceLast(k, s, strict) {
  return strict
    ? {
        mapIndex(I, S, T) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            T[I[i + s]] = S[I[i + k - 1]];
          }
        }
      }
    : {
        mapIndex(I, S, T) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = lastDefined(S, I, i, k);
          }
        }
      };
}
