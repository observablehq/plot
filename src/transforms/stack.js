import {InternMap, ascending, cumsum, group, range, sum} from "d3-array";
import {maybeSort, valueof} from "../mark.js";

export function stackX(data, {x, y, ...options}) {
  const [, {x: y_, y1: x1, y2: x2, y: x_, ...rest}] = stackY(data, {x: y, y: x, ...options});
  return [data, {...rest, x1, x2, x: x_, y: y_}];
}

export function stackY(data, {x, key = x, y, z, rank = z, offset, sort, ...options}) {
  // note: mutates {data}, in order to work with facets
  if (sort = maybeSort(sort)) {
    const sorted = sort(data);
    for (let k = 0; k < data.length; k++) data[k] = sorted[k];
  }
  const X = valueof(data, key);
  const Y = valueof(data, y);
  const Z = valueof(data, z);
  const R = valueof(data, rank);
  const n = data.length;
  const I = range(n);
  const Y1 = new Float64Array(n);
  const Y2 = new Float64Array(n);
  
  const transform = (data, facets) => {
    console.warn(facets);
    for (const index of (facets === undefined ? [I] : facets)) {
      const Yp = new InternMap();
      const Yn = new InternMap();
      
      const stacks = group(index, i => X[i]);
      
      // optional vertical sort
      if (rank) for (const [, stack] of stacks) stack.sort((i, j) => ascending(R[i], R[j]));
      
      // stack
      for (const [key, stack] of stacks) {
        for (const i of stack) {
          const v = +Y[i];
          const [Y0, ceil, floor] = v < 0 ? [Yn, Y1, Y2] : [Yp, Y2, Y1];
          const y1 = floor[i] = Y0.has(key) ? Y0.get(key) : 0;
          const y2 = ceil[i] = y1 + +Y[i];
          Y0.set(key, isNaN(y2) ? y1 : y2);
        }
      }

      // offset
      if (offset === "expand") {
        for (const i of index) {
          const key = X[i];
          const floor = Yn.has(key) ? Yn.get(key) : 0;
          const ceil = Yp.has(key) ? Yp.get(key) : 0;
          const m = 1 / (ceil - floor || 1);
          Y1[i] = m * (-floor + Y1[i]);
          Y2[i] = m * (-floor + Y2[i]);
        }
      }
      if (offset === "silhouette") {
        for (const i of index) {
          const key = X[i];
          const floor = Yn.has(key) ? Yn.get(key) : 0;
          const ceil = Yp.has(key) ? Yp.get(key) : 0;
          const m = (ceil + floor) / 2;
          Y1[i] -= m;
          Y2[i] -= m;
        }
      }
      if (offset === "wiggle") {
        const prev = new InternMap();
        let y = 0;
        for (const [, stack] of stacks) {
          let j = -1;
          const Fi = stack.map(i => Math.abs(Y2[i] - Y1[i]));
          const Df = stack.map(i => {
            j = z ? Z[i] : ++j;
            const value = Y2[i] - Y1[i];
            const diff = prev.has(j) ? value - prev.get(j) : 0;
            prev.set(j, value);
            return diff;
          });
          const Cf1 = [0, ...cumsum(Df)];
          for (const i of stack) {
            Y1[i] += y;
            Y2[i] += y;
          }
          const s1 = sum(Fi);
          if (s1) y -= sum(Fi, (d, i) => (Df[i] / 2 + Cf1[i]) * d) / s1;
        }
      }
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

function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}