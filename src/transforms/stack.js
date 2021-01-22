import {InternMap} from "d3-array";
import {valueof} from "../mark";

// TODO configurable series order
export function stackX(data, {x, y, ...options}) {
  const X = valueof(data, x);
  const Y = valueof(data, y);
  const n = X.length;
  const X0 = new InternMap();
  const X1 = new Float64Array(n);
  const X2 = new Float64Array(n);
  for (let i = 0; i < n; ++i) {
    const k = Y[i];
    const x1 = X1[i] = X0.has(k) ? X0.get(k) : 0;
    const x2 = X2[i] = x1 + +X[i];
    X0.set(k, isNaN(x2) ? x1 : x2);
  }
  return [data, {...options, x1: maybeLabel(X1, x), x2: X2, y: maybeLabel(Y, y)}];
}

// TODO configurable series order
export function stackY(data, {x, y, ...options}) {
  const X = valueof(data, x);
  const Y = valueof(data, y);
  const n = X.length;
  const Y0 = new InternMap();
  const Y1 = new Float64Array(n);
  const Y2 = new Float64Array(n);
  for (let i = 0; i < n; ++i) {
    const k = X[i];
    const y1 = Y1[i] = Y0.has(k) ? Y0.get(k) : 0;
    const y2 = Y2[i] = y1 + +Y[i];
    Y0.set(k, isNaN(y2) ? y1 : y2);
  }
  return [data, {...options, x: maybeLabel(X, x), y1: maybeLabel(Y1, y), y2: Y2}];
}

// If x is a labeled value, propagate the label to the returned value array.
function maybeLabel(X, x) {
  const label = typeof x === "string" ? x : x ? x.label : undefined;
  if (label !== undefined) X.label = label;
  return X;
}
