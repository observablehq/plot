import {group, mean, median} from "d3-array";
import {defined} from "../defined.js";
import {maybeTransform, maybeLazyChannel, maybeZ, take, valueof} from "../mark.js";

export function normalizeX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = normalize(options, x, x1, x2);
  return {...transform, x: X, x1: X1, x2: X2};
}

export function normalizeY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = normalize(options, y, y1, y2);
  return {...transform, y: Y, y1: Y1, y2: Y2};
}

function normalize({basis, ...options} = {}, ...inputs) {
  const channels = inputs.map(i => [i, ...maybeLazyChannel(i)]);
  const z = maybeZ(options);
  basis = maybeBasis(basis);
  return [
    {
      ...options,
      transform: maybeTransform(options, (data, index) => {
        const n = data.length;
        const Z = valueof(data, z);
        for (const [s,, setT] of channels) {
          if (s == null) continue;
          const S = valueof(data, s, Float64Array);
          const T = setT(new Float64Array(n).fill());
          for (const facet of index) {
            for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
              const b = +basis(I, S);
              for (const i of I) {
                T[i] = S[i] / b;
              }
            }
          }
        }
        return {data, index};
      })
    },
    ...channels.map(([, T]) => T)
  ];
}

function maybeBasis(basis) {
  if (basis === undefined) return basisFirst;
  if (typeof basis === "function") return (I, S) => basis(take(S, I));
  switch ((basis + "").toLowerCase()) {
    case "first": return basisFirst;
    case "last": return basisLast;
    case "mean": return basisMean;
    case "median": return basisMedian;
  }
  throw new Error("invalid basis");
}

function basisFirst(I, S) {
  for (let i = 0; i < I.length; ++i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
}

function basisLast(I, S) {
  for (let i = I.length - 1; i >= 0; --i) {
    const s = S[I[i]];
    if (defined(s)) return s;
  }
}

function basisMean(I, S) {
  return mean(I, i => S[i]);
}

function basisMedian(I, S) {
  return median(I, i => S[i]);
}
