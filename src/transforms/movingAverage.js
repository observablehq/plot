import {lazyChannel, maybeColor, range, valueof} from "../mark.js";

export function movingAverageX({x, ...options} = {}) {
  const [transform, X] = movingAverage(x, options);
  return {...options, transform, x: X};
}

export function movingAverageY({y, ...options} = {}) {
  const [transform, Y] = movingAverage(y, options);
  return {...options, transform, y: Y};
}

// TODO allow partially-defined data
function movingAverage(y, {k, z, fill, stroke}) {
  if (!((k = Math.floor(k)) > 0)) throw new Error(`invalid k: ${k}`);
  if (z === undefined) ([z] = maybeColor(fill));
  if (z === undefined) ([z] = maybeColor(stroke));
  const s = k >> 1;
  const [M, setM] = lazyChannel(y);
  return [
    (data, facets) => {
      const I = range(data);
      const Y = valueof(data, y, Float64Array);
      const M = setM(new Float64Array(data.length).fill());
      for (const index of facets === undefined ? [I] : facets) {
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
      return {index: facets === undefined ? I : facets, data};
    },
    M
  ];
}
