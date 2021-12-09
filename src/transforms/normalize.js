import {extent, deviation, max, mean, median, min, sum} from "d3";
import {defined} from "../defined.js";
import {take} from "../mark.js";
import {mapX, mapY} from "./map.js";

export function normalizeX(basis, options) {
  if (arguments.length === 1) ({basis, ...options} = basis);
  return mapX(normalize(basis), options);
}

export function normalizeY(basis, options) {
  if (arguments.length === 1) ({basis, ...options} = basis);
  return mapY(normalize(basis), options);
}

export function normalize(basis) {
  if (basis === undefined) return normalizeFirst;
  if (typeof basis === "function") return normalizeBasis((I, S) => basis(take(S, I)));
  switch (`${basis}`.toLowerCase()) {
    case "deviation": return normalizeDeviation;
    case "first": return normalizeFirst;
    case "last": return normalizeLast;
    case "max": return normalizeMax;
    case "mean": return normalizeMean;
    case "median": return normalizeMedian;
    case "min": return normalizeMin;
    case "sum": return normalizeSum;
    case "extent": return normalizeExtent;
  }
  throw new Error("invalid basis");
}

function normalizeBasis(basis) {
  return {
    map(I, S, T) {
      const b = +basis(I, S);
      for (const i of I) {
        T[i] = S[i] === null ? NaN : S[i] / b;
      }
    }
  };
}

const normalizeExtent = {
  map(I, S, T) {
    const [s1, s2] = extent(I, i => S[i]), d = s2 - s1;
    for (const i of I) {
      T[i] = S[i] === null ? NaN : (S[i] - s1) / d;
    }
  }
};

const normalizeFirst = normalizeBasis((I, S) => {
  for (let i = 0; i < I.length; ++i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
});

const normalizeLast = normalizeBasis((I, S) => {
  for (let i = I.length - 1; i >= 0; --i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
});

const normalizeDeviation = {
  map(I, S, T) {
    const m = mean(I, i => S[i]);
    const d = deviation(I, i => S[i]);
    for (const i of I) {
      T[i] = S[i] === null ? NaN : d ? (S[i] - m) / d : 0;
    }
  }
};

const normalizeMax = normalizeBasis((I, S) => max(I, i => S[i]));
const normalizeMean = normalizeBasis((I, S) => mean(I, i => S[i]));
const normalizeMedian = normalizeBasis((I, S) => median(I, i => S[i]));
const normalizeMin = normalizeBasis((I, S) => min(I, i => S[i]));
const normalizeSum = normalizeBasis((I, S) => sum(I, i => S[i]));
