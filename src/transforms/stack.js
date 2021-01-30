import {InternMap, ascending, range} from "d3-array";
import {valueof} from "../mark";

export function stackX(data, {x, y, z, ...options}) {
  const [, {x: y_, y1: x1, y2: x2, y: x_, ...rest}] = stackY(data, {x: y, y: x, z, ...options});
  return [data, {...rest, x1, x2, x: x_, y: y_, z}];
}

export function stackY(data, {x, y, z, zOrder, offset, ...options}) {
  const X = valueof(data, x);
  const Y = valueof(data, y);
  const n = X.length;
  const I = range(n);
  const Y1 = new Float64Array(n);
  const Y2 = new Float64Array(n);
  
  // sort
  if (z) {
    const Z = valueof(data, z);
    if (zOrder) I.forEach(i => Z[i] = zOrder.indexOf(Z[i]));
    I.sort((i, j) => ascending(Z[i], Z[j]));
  }
  
  const transform = (data, facets) => {
    for (const facet of (facets === undefined ? [I] : facets)) {
      const Yp = new InternMap();
      const Yn = new InternMap();

      // stack
      for (const i of facet) {
        const k = X[i];
        const v = +Y[i];
        const [Y0, ceil, floor] = v < 0 ? [Yn, Y1, Y2] : [Yp ,Y2, Y1];
        const y1 = floor[i] = Y0.has(k) ? Y0.get(k) : 0;
        const y2 = ceil[i] = y1 + +Y[i];
        Y0.set(k, isNaN(y2) ? y1 : y2);
      }

      // offset
      if (offset === "expand") {
        for (const i of facet) {
          const k = X[i];
          const floor = Yn.has(k) ? Yn.get(k) : 0;
          const ceil = Yp.has(k) ? Yp.get(k) : 0;
          const m = 1 / (ceil - floor || 1);
          Y1[i] = m * (-floor + Y1[i]);
          Y2[i] = m * (-floor + Y2[i]);
        }
      }
      if (offset === "silhouette") {
        for (const i of facet) {
          const k = X[i];
          const floor = Yn.has(k) ? Yn.get(k) : 0;
          const ceil = Yp.has(k) ? Yp.get(k) : 0;
          const m = (ceil + floor) / 2;
          Y1[i] -= m;
          Y2[i] -= m;
        }
      }
      // todo "wiggle"
    }

    return {index: facets === undefined ? I : facets, data};
  };
  
  return [data, {
    ...options,
    transform,
    x: maybeLabel(X, x),
    y1: maybeLabel(Y1, y),
    y2: Y2,
    y: (_,i) => (Y1[i] + Y2[i]) / 2,
    z
  }];
}

// If x is a labeled value, propagate the label to the returned value array.
function maybeLabel(X, x) {
  const label = typeof x === "string" ? x : x ? x.label : undefined;
  if (label !== undefined) X.label = label;
  return X;
}
