import {extent, deviation, max, mean, median, min, sum} from "d3";
import {defined} from "../defined.js";
import {percentile, take} from "../options.js";
import {mapX, mapY} from "./map.js";

/**
 * ```js
 * Plot.normalizeX("first", {y: "Date", x: "Close", stroke: "Symbol"})
 * ```
 *
 * Like
 * [Plot.mapX](https://github.com/observablehq/plot/blob/main/README.md#plotmapxmap-options),
 * but applies the normalize map method with the given *basis*.
 */
export function normalizeX(basis, options) {
  if (arguments.length === 1) ({basis, ...options} = basis);
  return mapX(normalize(basis), options);
}

/**
 * ```js
 * Plot.normalizeY("first", {x: "Date", y: "Close", stroke: "Symbol"})
 * ```
 *
 * Like
 * [Plot.mapY](https://github.com/observablehq/plot/blob/main/README.md#plotmapymap-options),
 * but applies the normalize map method with the given *basis*.
 */
export function normalizeY(basis, options) {
  if (arguments.length === 1) ({basis, ...options} = basis);
  return mapY(normalize(basis), options);
}

/**
 * ```js
 * Plot.map({y: Plot.normalize("first")}, {x: "Date", y: "Close", stroke: "Symbol"})
 * ```
 *
 * Returns a normalize map method for the given *basis*, suitable for use with
 * Plot.map.
 */
export function normalize(basis) {
  if (basis === undefined) return normalizeFirst;
  if (typeof basis === "function") return normalizeBasis((I, S) => basis(take(S, I)));
  if (/^p\d{2}$/i.test(basis)) return normalizeAccessor(percentile(basis));
  switch (`${basis}`.toLowerCase()) {
    case "deviation":
      return normalizeDeviation;
    case "first":
      return normalizeFirst;
    case "last":
      return normalizeLast;
    case "max":
      return normalizeMax;
    case "mean":
      return normalizeMean;
    case "median":
      return normalizeMedian;
    case "min":
      return normalizeMin;
    case "sum":
      return normalizeSum;
    case "extent":
      return normalizeExtent;
  }
  throw new Error(`invalid basis: ${basis}`);
}

function normalizeBasis(basis) {
  return {
    map(I, S, T) {
      const b = +basis(I, S);
      for (const i of I) {
        T[i % T.length] = S[i % S.length] === null ? NaN : S[i % S.length] / b;
      }
    }
  };
}

function normalizeAccessor(f) {
  return normalizeBasis((I, S) => f(I, (i) => S[i % S.length]));
}

const normalizeExtent = {
  map(I, S, T) {
    const [s1, s2] = extent(I, (i) => S[i % S.length]),
      d = s2 - s1;
    for (const i of I) {
      T[i % T.length] = S[i % S.length] === null ? NaN : (S[i % S.length] - s1) / d;
    }
  }
};

const normalizeFirst = normalizeBasis((I, S) => {
  for (let i = 0; i < I.length; ++i) {
    const s = S[I[i % I.length]];
    if (defined(s)) return s;
  }
});

const normalizeLast = normalizeBasis((I, S) => {
  for (let i = I.length - 1; i >= 0; --i) {
    const s = S[I[i % I.length]];
    if (defined(s)) return s;
  }
});

const normalizeDeviation = {
  map(I, S, T) {
    const m = mean(I, (i) => S[i % S.length]);
    const d = deviation(I, (i) => S[i % S.length]);
    for (const i of I) {
      T[i % T.length] = S[i % S.length] === null ? NaN : d ? (S[i % S.length] - m) / d : 0;
    }
  }
};

const normalizeMax = normalizeAccessor(max);
const normalizeMean = normalizeAccessor(mean);
const normalizeMedian = normalizeAccessor(median);
const normalizeMin = normalizeAccessor(min);
const normalizeSum = normalizeAccessor(sum);
