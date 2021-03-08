import {group} from "d3-array";
import {maybeTransform, maybeLazyChannel, maybeZ, valueof} from "../mark.js";

export function normalizeX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = normalize(options, x, x1, x2);
  return {...options, transform, x: X, x1: X1, x2: X2};
}

export function normalizeY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = normalize(options, y, y1, y2);
  return {...options, transform, y: Y, y1: Y1, y2: Y2};
}

// TODO If the first value is undefined, scan forward?
function normalChange(I, S, T) {
  const basis = +S[I[0]];
  for (const i of I) {
    T[i] = S[i] / basis;
  }
}

function normalize(options, ...inputs) {
  const channels = inputs.map(i => [i, ...maybeLazyChannel(i)]);
  const z = maybeZ(options);
  const normal = normalChange; // TODO option
  return [
    maybeTransform(options, (data, index) => {
      const n = data.length;
      const Z = valueof(data, z);
      for (const [s,, setT] of channels) {
        if (s == null) continue;
        const S = valueof(data, s, Float64Array);
        const T = setT(new Float64Array(n).fill());
        for (const facet of index) {
          for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
            normal(I, S, T);
          }
        }
      }
      return {data, index};
    }),
    ...channels.map(([, T]) => T)
  ];
}
