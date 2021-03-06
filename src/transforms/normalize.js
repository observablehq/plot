import {group} from "d3-array";
import {maybeComposeTransform, maybeLazyChannel, maybeZ, valueof} from "../mark.js";

export function normalizeX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = normalize([x, x1, x2], options);
  return {...options, transform, x: X, x1: X1, x2: X2};
}

export function normalizeY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = normalize([y, y1, y2], options);
  return {...options, transform, y: Y, y1: Y1, y2: Y2};
}

// TODO If the first value is undefined, scan forward?
function normalChange(I, S, T) {
  const basis = +S[I[0]];
  for (const i of I) {
    T[i] = S[i] / basis;
  }
}

function normalize(inputs, options) {
  const channels = inputs.map(i => [i, ...maybeLazyChannel(i)]);
  const z = maybeZ(options);
  const normal = normalChange; // TODO option
  return [
    maybeComposeTransform(options, (data, index) => {
      const n = data.length;
      const Z = valueof(data, z);
      for (const [source,, setTarget] of channels) {
        if (source == null) continue;
        const S = valueof(data, source, Float64Array);
        const T = setTarget(new Float64Array(n));
        for (const facet of index) {
          for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
            normal(I, S, T);
          }
        }
      }
      return {data, index};
    }),
    ...channels.map(([, target]) => target)
  ];
}
