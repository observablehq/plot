import {InternMap} from "d3-array";
import {valueof} from "../mark";

export function stackX({x, y, ...options}) {
  const [transform, Y, x1, x2] = stack(y, x);
  return {...options, transform, y: Y, x1, x2};
}

export function stackY({x, y, ...options}) {
  const [transform, X, y1, y2] = stack(x, y);
  return {...options, transform, x: X, y1, y2};
}

// TODO configurable series order
function stack(x, y) {
  let X, Y1, Y2;
  return [
    data => {
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
    transform(() => X, x),
    transform(() => Y1, y),
    transform(() => Y2)
  ];
}

// If x is labeled, propagate the label to the returned channel transform.
function transform(transform, x) {
  return {
    transform,
    label: typeof x === "string" ? x : x ? x.label : undefined
  };
}
