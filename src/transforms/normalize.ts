import type {Basis, MarkOptions} from "../api.js";
import type {Datum, index, Series, Value, ValueArray} from "../data.js";
import type {pXX} from "../options.js";

import {extent, deviation, max, mean, median, min, sum} from "d3";
import {defined} from "../defined.js";
import {percentile, take} from "../options.js";
import {mapX, mapY} from "./map.js";

export function normalizeX<T extends Datum>(basis: Basis | MarkOptions<T> | undefined, options?: MarkOptions<T>) {
  if (arguments.length === 1) ({basis, ...options} = basis as MarkOptions<T>);
  return mapX(normalize(basis as Basis), options);
}

export function normalizeY<T extends Datum>(basis: Basis | MarkOptions<T> | undefined, options?: MarkOptions<T>) {
  if (arguments.length === 1) ({basis, ...options} = basis as MarkOptions<T>);
  return mapY(normalize(basis as Basis), options);
}

export function normalize(basis: Basis) {
  if (basis === undefined) return normalizeFirst;
  if (typeof basis === "function") return normalizeBasis((I: Series, S: ValueArray) => basis(take(S, I)));
  if (/^p\d{2}$/i.test(basis)) return normalizeAccessor(percentile(basis as pXX));
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

function normalizeBasis(basis: (I: Series, S: ValueArray) => Value) {
  return {
    map(I: Series, S: ValueArray, T: ValueArray) {
      const b = +(basis(I, S) as number);
      for (const i of I) {
        T[i] = S[i] === null ? NaN : (S[i] as number) / b;
      }
    }
  };
}

function normalizeAccessor(f: (I: Series, b: (i: index) => Value) => Value) {
  return normalizeBasis((I, S) => f(I, (i: index) => S[i]));
}

const normalizeExtent = {
  map(I: Series, S: ValueArray, T: ValueArray) {
    const [s1, s2] = extent(I, (i) => S[i] as number),
      d = (s2 as number) - (s1 as number);
    for (const i of I) {
      T[i] = S[i] === null ? NaN : ((S[i] as number) - (s1 as number)) / d;
    }
  }
};

const normalizeFirst = normalizeBasis((I: Series, S: ValueArray) => {
  for (let i = 0; i < I.length; ++i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
});

const normalizeLast = normalizeBasis((I: Series, S: ValueArray) => {
  for (let i = I.length - 1; i >= 0; --i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
});

const normalizeDeviation = {
  map(I: Series, S: ValueArray, T: ValueArray) {
    const m = mean(I, (i) => S[i] as number);
    const d = deviation(I, (i) => S[i] as number);
    for (const i of I) {
      T[i] = S[i] === null ? NaN : d ? ((S[i] as number) - (m as number)) / d : 0;
    }
  }
};

const normalizeMax = normalizeAccessor(max);
const normalizeMean = normalizeAccessor(mean);
const normalizeMedian = normalizeAccessor(median);
const normalizeMin = normalizeAccessor(min);
const normalizeSum = normalizeAccessor(sum);
