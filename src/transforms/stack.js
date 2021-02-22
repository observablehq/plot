import {InternMap, ascending, cumsum, descending, group, groupSort, maxIndex, range, rollup, sum} from "d3-array";
import {field, maybeSort, take, valueof} from "../mark.js";

export function stackX(data, {x, y, ...options}) {
  const [, {x: y_, y1: x1, y2: x2, y: x_, ...rest}] = stackY(data, {x: y, y: x, ...options});
  return [data, {...rest, x1, x2, x: x_, y: y_}];
}

export function stackY(data, {
  x,
  key = x,
  y,
  z,
  rank,
  reverse = ["descending", "reverse"].includes(rank),
  offset,
  sort,
  ...options
}) {
  const X = valueof(data, key);
  const Y = valueof(data, y);
  const Z = valueof(data, z);
  const R = maybeRank(rank, data, X, Y, Z);
  const n = data.length;
  const I = range(n);
  const Y1 = new Float64Array(n);
  const Y2 = new Float64Array(n);
  sort = maybeSort(sort);
  
  const transform = (data, facets) => {
    for (const index of (facets === undefined ? [I] : facets)) {
      
      if (sort) {
        const facet = take(data, index);
        const index0 = index.slice();
        const sorted = sort(facet);
        for (let k = 0; k < index.length; k++) index[k] = index0[facet.indexOf(sorted[k])];
      }
      
      const Yp = new InternMap();
      const Yn = new InternMap();
      
      const stacks = group(index, i => X[i]);
      
      // rank sort
      if (R) {
        const a = reverse ? descending : ascending;
        for (const [, stack] of stacks) stack.sort((i, j) => a(R[i], R[j]));
      }
      
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

// well-known ranking strategies by series
function maybeRank(rank, data, X, Y, Z) {
  if (rank == null) return [null];
  // d3.stackOrderNone, sorts series by key, ascending
  // d3.stackOrderReverse, sorts series by key, descending
  if (rank === "key" || rank === "none" || rank === "reverse") {
    return Z;
  }
  // d3.stackOrderAscending, sorts series by sum of value, ascending
  if (rank === "sum" || rank === "ascending" || rank === "descending") {
    const S = groupSort(range(data.length), g => sum(g, i => Y[i]), i => Z[i]);
    return Z.map(z => S.indexOf(z));
  }
  // ranks items by value
  if (rank === "value") {
    return Y;
  }
  // d3.stackOrderAppearance, sorts series by x = argmax of value
  if (rank === "appearance") {
    const K = groupSort(
      range(data.length),
      v => X[v[maxIndex(v, i => Y[i])]],
      i => Z[i]
    );
    return Z.map(z => K.indexOf(z));
  }
  // d3.stackOrderInsideOut, sorts series by x = argmax of value, then rearranges them
  // inside out by alternating series according to the sign of a running divergence
  // of their sums
  if (rank === "insideOut") {
    const K = groupSort(
      range(data.length),
      v => X[v[maxIndex(v, i => Y[i])]],
      i => Z[i]
    );
    const sums = rollup(range(data.length), v => sum(v, i => Y[i]), i => Z[i]);
    const order = [];
    let diff = 0;
    for (const k of K) {
      if (diff < 0) {
        diff += sums.get(k);
        order.push(k);
      } else {
        diff -= sums.get(k);
        order.unshift(k);
      }
    }
    return Z.map(z => order.indexOf(z));
  }
  // any other string is a datum accessor
  if (typeof rank === "string") {
    return valueof(data, field(rank));
  }
  // rank can be an array of z (particularly useful with groupSort)
  if (rank.indexOf) {
    return Z.map(z => rank.indexOf(z));
  }
  // final case, a generic function
  if (typeof rank === "function") {
    return valueof(data, rank);
  }
}
