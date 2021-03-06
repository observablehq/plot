import {group} from "d3-array";
import {lazyChannel, maybeComposeTransform, maybeZ, valueof} from "../mark.js";

export function normalizeX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = normalize(options, x, x1, x2);
  return {...options, transform, x: X, x1: X1, x2: X2};
}

export function normalizeY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = normalize(options, y, y1, y2);
  return {...options, transform, y: Y, y1: Y1, y2: Y2};
}

// TODO If the first value is undefined, scan forward?
function normalChange(I, V, N) {
  const basis = +V[I[0]];
  for (const i of I) {
    N[i] = V[i] / basis;
  }
}

function normalize({transform, ...options} = {}, ...keys) {
  const z = maybeZ(options);
  const channels = (keys = keys.filter(k => k != null)).map(lazyChannel);
  const normal = normalChange; // TODO option
  return [
    maybeComposeTransform(transform, (data, index) => {
      const n = data.length;
      const Z = valueof(data, z);
      for (let i = 0; i < keys.length; ++i) {
        const V = valueof(data, keys[i], Float64Array);
        const N = channels[i][1](new Float64Array(n));
        for (const facet of index) {
          for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
            normal(I, V, N);
          }
        }
      }
      return {data, index};
    }),
    ...channels.map(([channel]) => channel)
  ];
}
