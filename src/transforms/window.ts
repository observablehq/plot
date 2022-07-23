import type {MarkOptions, WindowOptions} from "../api.js";
import type {Datum, Value, index, NumericArray, Series, ValueArray} from "../data.js";
import type {pXX} from "../options.js";

import {deviation, max, min, median, mode, quantile, variance} from "d3";
import {defined} from "../defined.js";
import {take} from "../options.js";
import {warn} from "../warnings.js";
import {mapX, mapY} from "./map.js";

export function windowX<T extends Datum>(
  windowOptions: number | MarkOptions<T> = {},
  options: number | MarkOptions<T>
) {
  if (arguments.length === 1) options = windowOptions;
  return mapX(window(windowOptions), options as MarkOptions<T>);
}

export function windowY<T extends Datum>(
  windowOptions: number | MarkOptions<T> = {},
  options: number | MarkOptions<T>
) {
  if (arguments.length === 1) options = windowOptions;
  return mapY(window(windowOptions), options as MarkOptions<T>);
}

export function window<T extends Datum>(options: number | MarkOptions<T> = {}) {
  if (typeof options === "number") options = {k: options} as MarkOptions<T>;
  // eslint-disable-next-line prefer-const
  let {k, reduce, shift, anchor, strict} = options;
  if (anchor === undefined && shift !== undefined) {
    anchor = maybeShift(shift);
    warn(`Warning: the shift option is deprecated; please use anchor "${anchor}" instead.`);
  }
  if (!((k = Math.floor(k as number)) > 0)) throw new Error(`invalid k: ${k}`);
  return maybeReduce(reduce)(k, maybeAnchor(anchor, k), strict);
}

function maybeAnchor(anchor = "middle", k: number) {
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

function maybeShift(shift: string) {
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

function maybeReduce(reduce: WindowOptions["reduce"] = "mean") {
  if (typeof reduce === "string") {
    if (/^p\d{2}$/i.test(reduce)) return reduceNumbers(percentile(reduce as pXX));
    switch (reduce.toLowerCase()) {
      case "deviation":
        return reduceNumbers(deviation);
      case "max":
        return reduceArray(max);
      case "mean":
        return reduceMean;
      case "median":
        return reduceNumbers(median);
      case "min":
        return reduceArray(min);
      case "mode":
        return reduceArray(mode as (X: ValueArray) => Value); // TODO: fix @types/d3
      case "sum":
        return reduceSum;
      case "variance":
        return reduceNumbers(variance);
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
  return reduceArray(reduce);
}

function slice(I: Series, i: index, j: index) {
  return (I as Uint32Array).subarray ? (I as Uint32Array).subarray(i, j) : I.slice(i, j);
}

// Note that the subarray may include NaN in the non-strict case; we expect the
// function f to handle that itself (e.g., by filtering as needed). The D3
// reducers (e.g., min, max, mean, median) do, and it’s faster to avoid
// redundant filtering.
function reduceNumbers(f: (X: NumericArray) => Value) {
  return (k: number, s: number, strict: boolean | undefined) =>
    strict
      ? {
          map(I: Series, S: ValueArray, T: ValueArray) {
            const C = Float64Array.from(I, (i) => (S[i] === null ? NaN : (S[i] as number)));
            let nans = 0;
            for (let i = 0; i < k - 1; ++i) if (isNaN(C[i])) ++nans;
            for (let i = 0, n = I.length - k + 1; i < n; ++i) {
              if (isNaN(C[i + k - 1])) ++nans;
              T[I[i + s]] = nans === 0 ? (f(C.subarray(i, i + k)) as number) : NaN;
              if (isNaN(C[i])) --nans;
            }
          }
        }
      : {
          map(I: Series, S: ValueArray, T: ValueArray) {
            const C = Float64Array.from(I, (i) => (S[i] === null ? NaN : (S[i] as number)));
            for (let i = -s; i < 0; ++i) {
              T[I[i + s]] = f(C.subarray(0, i + k)) as number;
            }
            for (let i = 0, n = I.length - s; i < n; ++i) {
              T[I[i + s]] = f(C.subarray(i, i + k)) as number;
            }
          }
        };
}

function reduceArray(f: (X: ValueArray) => Value) {
  return (k: number, s: number, strict: boolean | undefined) =>
    strict
      ? {
          map(I: Series, S: ValueArray, T: ValueArray) {
            let count = 0;
            for (let i = 0; i < k - 1; ++i) count += defined(S[I[i]]) as unknown as number; // TODO! doh!
            for (let i = 0, n = I.length - k + 1; i < n; ++i) {
              count += defined(S[I[i + k - 1]]) as unknown as number;
              if (count === k) T[I[i + s]] = f(take(S, slice(I, i, i + k)));
              count -= defined(S[I[i]]) as unknown as number;
            }
          }
        }
      : {
          map(I: Series, S: ValueArray, T: ValueArray) {
            for (let i = -s; i < 0; ++i) {
              T[I[i + s]] = f(take(S, slice(I, 0, i + k)));
            }
            for (let i = 0, n = I.length - s; i < n; ++i) {
              T[I[i + s]] = f(take(S, slice(I, i, i + k)));
            }
          }
        };
}

function reduceSum(k: number, s: number, strict: boolean | undefined) {
  return strict
    ? {
        map(I: Series, S: ValueArray, T: ValueArray) {
          let nans = 0;
          let sum = 0;
          for (let i = 0; i < k - 1; ++i) {
            const v = S[I[i]];
            if (v === null || isNaN(v as number)) ++nans;
            else sum += +(v as number);
          }
          for (let i = 0, n = I.length - k + 1; i < n; ++i) {
            const a = S[I[i]];
            const b = S[I[i + k - 1]];
            if (b === null || isNaN(b as number)) ++nans;
            else sum += +(b as number);
            T[I[i + s]] = nans === 0 ? sum : NaN;
            if (a === null || isNaN(a as number)) --nans;
            else sum -= +(a as number);
          }
        }
      }
    : {
        map(I: Series, S: ValueArray, T: ValueArray) {
          let sum = 0;
          const n = I.length;
          for (let i = 0, j = Math.min(n, k - s - 1); i < j; ++i) {
            sum += +(S[I[i]] as number) || 0;
          }
          for (let i = -s, j = n - s; i < j; ++i) {
            sum += +(S[I[i + k - 1]] as number) || 0;
            T[I[i + s]] = sum;
            sum -= +(S[I[i]] as number) || 0;
          }
        }
      };
}

function reduceMean(k: number, s: number, strict: boolean | undefined) {
  if (strict) {
    const sum = reduceSum(k, s, strict);
    return {
      map(I: Series, S: ValueArray, T: ValueArray) {
        sum.map(I, S, T);
        for (let i = 0, n = I.length - k + 1; i < n; ++i) {
          (T[I[i + s]] as number) /= k;
        }
      }
    };
  } else {
    return {
      map(I: Series, S: ValueArray, T: ValueArray) {
        let sum = 0;
        let count = 0;
        const n = I.length;
        for (let i = 0, j = Math.min(n, k - s - 1); i < j; ++i) {
          let v = S[I[i]];
          if (v !== null && !isNaN((v = +(v as number)))) (sum += v), ++count;
        }
        for (let i = -s, j = n - s; i < j; ++i) {
          let a = S[I[i + k - 1]];
          let b = S[I[i]];
          if (a !== null && !isNaN((a = +(a as number)))) (sum += a), ++count;
          T[I[i + s]] = sum / count;
          if (b !== null && !isNaN((b = +(b as number)))) (sum -= b), --count;
        }
      }
    };
  }
}

function firstDefined(S: ValueArray, I: Series, i: number, k: number) {
  for (let j = i + k; i < j; ++i) {
    const v = S[I[i]];
    if (defined(v)) return v;
  }
}

function lastDefined(S: ValueArray, I: Series, i: number, k: number) {
  for (let j = i + k - 1; j >= i; --j) {
    const v = S[I[j]];
    if (defined(v)) return v;
  }
}

function firstNumber(S: ValueArray, I: Series, i: number, k: number) {
  for (let j = i + k; i < j; ++i) {
    let v = S[I[i]];
    if (v !== null && !isNaN((v = +(v as number)))) return v;
  }
}

function lastNumber(S: ValueArray, I: Series, i: number, k: number) {
  for (let j = i + k - 1; j >= i; --j) {
    let v = S[I[j]];
    if (v !== null && !isNaN((v = +(v as number)))) return v;
  }
}

function reduceDifference(k: number, s: number, strict: boolean | undefined) {
  return strict
    ? {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            const a = S[I[i]];
            const b = S[I[i + k - 1]];
            T[I[i + s]] = a === null || b === null ? NaN : (b as number) - (a as number);
          }
        }
      }
    : {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = (lastNumber(S, I, i, k) as number) - (firstNumber(S, I, i, k) as number);
          }
        }
      };
}

function reduceRatio(k: number, s: number, strict: boolean | undefined) {
  return strict
    ? {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            const a = S[I[i]];
            const b = S[I[i + k - 1]];
            T[I[i + s]] = a === null || b === null ? NaN : (b as number) / (a as number);
          }
        }
      }
    : {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = (lastNumber(S, I, i, k) as number) / (firstNumber(S, I, i, k) as number);
          }
        }
      };
}

function reduceFirst(k: number, s: number, strict: boolean | undefined) {
  return strict
    ? {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            T[I[i + s]] = S[I[i]];
          }
        }
      }
    : {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = firstDefined(S, I, i, k);
          }
        }
      };
}

function reduceLast(k: number, s: number, strict: boolean | undefined) {
  return strict
    ? {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = 0, n = I.length - k; i < n; ++i) {
            T[I[i + s]] = S[I[i + k - 1]];
          }
        }
      }
    : {
        map(I: Series, S: ValueArray, T: ValueArray) {
          for (let i = -s, n = I.length - k + s + 1; i < n; ++i) {
            T[I[i + s]] = lastDefined(S, I, i, k);
          }
        }
      };
}

// takes an array of values
function percentile(reduce: pXX) {
  const p = +`${reduce}`.slice(1) / 100;
  return (X: NumericArray) => quantile(X, p);
}
