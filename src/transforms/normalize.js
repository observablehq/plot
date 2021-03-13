import {mean, median, sum} from "d3";
import {defined} from "../defined.js";
import {take} from "../mark.js";
import {mapi} from "./map.js";

export function normalizeX(options) {
  const map = normalize(options);
  return mapi([["x", map], ["x1", map], ["x2", map]], options);
}

export function normalizeY(options) {
  const map = normalize(options);
  return mapi([["y", map], ["y1", map], ["y2", map]], options);
}

function normalize({basis} = {}) {
  if (basis === undefined) return normalizeFirst;
  if (typeof basis === "function") return normalizeBasis((I, S) => basis(take(S, I)));
  switch ((basis + "").toLowerCase()) {
    case "first": return normalizeFirst;
    case "last": return normalizeLast;
    case "mean": return normalizeMean;
    case "median": return normalizeMedian;
    case "sum": return normalizeSum;
  }
  throw new Error("invalid basis");
}

function normalizeBasis(basis) {
  return (I, S, T) => {
    const b = +basis(I, S);
    for (const i of I) T[i] = S[i] / b;
  };
}

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

const normalizeMean = normalizeBasis((I, S) => mean(I, i => S[i]));
const normalizeMedian = normalizeBasis((I, S) => median(I, i => S[i]));
const normalizeSum = normalizeBasis((I, S) => sum(I, i => S[i]));
