import {group} from "d3-array";
import {maybeLazyChannel, maybeColor, range, valueof} from "../mark.js";

export function movingAverageX({x, x1, x2, ...options} = {}) {
  const [transform, X, X1, X2] = movingAverage(x, x1, x2, options);
  return {...options, transform, x: X, x1: X1, x2: X2};
}

export function movingAverageY({y, y1, y2, ...options} = {}) {
  const [transform, Y, Y1, Y2] = movingAverage(y, y1, y2, options);
  return {...options, transform, y: Y, y1: Y1, y2: Y2};
}

// TODO allow partially-defined data
function movingAverage(y, y1, y2, {k, z, fill, stroke}) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  if (z === undefined) ([z] = maybeColor(fill));
  if (z === undefined) ([z] = maybeColor(stroke));
  const s = k >> 1;
  const [M, setM] = maybeLazyChannel(y);
  const [M1, setM1] = maybeLazyChannel(y1);
  const [M2, setM2] = maybeLazyChannel(y2);
  return [
    (data, facets) => {
      const n = data.length;
      const I = range(data);
      const Z = valueof(data, z);
      const Y = valueof(data, y, Float64Array);
      const Y1 = valueof(data, y1, Float64Array);
      const Y2 = valueof(data, y2, Float64Array);
      const channels = [];
      if (Y) channels.push([Y, setM(new Float64Array(n).fill())]);
      if (Y1) channels.push([Y1, setM1(new Float64Array(n).fill())]);
      if (Y2) channels.push([Y2, setM2(new Float64Array(n).fill())]);
      for (const facet of facets === undefined ? [I] : facets) {
        for (const index of Z ? group(facet, i => Z[i]).values() : [facet]) {
          for (const [Y, M] of channels) {
            let i = 0;
            let sum = 0;
            for (const n = Math.min(k - 1, index.length); i < n; ++i) {
              sum += Y[index[i]];
            }
            for (const n = index.length; i < n; ++i) {
              sum += Y[index[i]];
              M[index[i - s]] = sum / k;
              sum -= Y[index[i - k + 1]];
            }
          }
        }
      }
      return {index: facets === undefined ? I : facets, data};
    },
    M,
    M1,
    M2
  ];
}
