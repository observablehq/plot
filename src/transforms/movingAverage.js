import {group} from "d3-array";
import {maybeLazyChannel, valueof, maybeZ, maybeTransform} from "../mark.js";

export function movingAverageX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = movingAverage(options, x, x1, x2);
  return {...transform, x: X, x1: X1, x2: X2};
}

export function movingAverageY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = movingAverage(options, y, y1, y2);
  return {...transform, y: Y, y1: Y1, y2: Y2};
}

// TODO allow partially-defined data
// TODO expose shift option (leading, trailing, centered)
function movingAverage({k, ...options}, ...inputs) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  const channels = inputs.map(i => [i, ...maybeLazyChannel(i)]);
  const z = maybeZ(options);
  const m = k >> 1;
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
              let i = 0;
              let sum = 0;
              for (const n = Math.min(k - 1, I.length); i < n; ++i) {
                sum += S[I[i]];
              }
              for (const n = I.length; i < n; ++i) {
                sum += S[I[i]];
                T[I[i - m]] = sum / k;
                sum -= S[I[i - k + 1]];
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
