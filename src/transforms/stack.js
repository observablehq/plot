import {InternMap} from "d3-array";
import {valueof} from "../mark";

// TODO configurable series order
export function stackX({x, y, ...options}) {
  let X1, X2, Y;
  return {
    ...options,
    transform(data) {
      const X = valueof(data, x);
      Y = valueof(data, y);
      const n = X.length;
      const X0 = new InternMap();
      X1 = new Float64Array(n);
      X2 = new Float64Array(n);
      for (let i = 0; i < n; ++i) {
        const k = Y[i];
        const x1 = X1[i] = X0.has(k) ? X0.get(k) : 0;
        const x2 = X2[i] = x1 + +X[i];
        X0.set(k, isNaN(x2) ? x1 : x2);
      }
      return data;
    },
    x1: transform(() => X1, x),
    x2: transform(() => X2),
    y: transform(() => Y, y)
  };
}

// TODO configurable series order
export function stackY({x, y, ...options}) {
  let Y1, Y2, X;
  return {
    ...options,
    transform(data) {
      X = valueof(data, x);
      const Y = valueof(data, y);
      const n = X.length;
      const Y0 = new InternMap();
      Y1 = new Float64Array(n);
      Y2 = new Float64Array(n);
      for (let i = 0; i < n; ++i) {
        const k = X[i];
        const y1 = Y1[i] = Y0.has(k) ? Y0.get(k) : 0;
        const y2 = Y2[i] = y1 + +Y[i];
        Y0.set(k, isNaN(y2) ? y1 : y2);
      }
      return data;
    },
    y1: transform(() => Y1, y),
    y2: transform(() => Y2, y),
    x: transform(() => X, x)
  };
}

// If x is labeled, propagate the label to the returned channel transform.
function transform(transform, x) {
  return {
    transform,
    label: typeof x === "string" ? x : x ? x.label : undefined
  };
}
