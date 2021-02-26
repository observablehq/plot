import {InternMap, ascending, cumsum, descending, group, groupSort, maxIndex, range, rollup, sum} from "d3-array";
import {field, maybeSort, take, valueof} from "../mark.js";

export function stackX(data, {x, y, ...options}) {
  const A = stack(data, {location: y, value: x, ...options});
  {
    const [data, {location, value, low, high, mid, ...options}] = A;
    return [data, {
      y: location,
      value,
      x: mid,
      x1: low,
      x2: high,
      ...options
    }];
  }
} 

export function stackY(data, {x, y, ...options}) {
  const A = stack(data, {location: x, value: y, ...options});
  {
    const [data, {location, value, low, high, mid, ...options}] = A;
    return [data, {
      x: location,
      value,
      y1: low,
      y2: high,
      y: mid,
      ...options
    }];
  }
} 

export function stack(data, {
  location,
  value = () => 1,
  z,
  offset,
  sort,
  rank,
  reverse = ["descending", "reverse"].includes(rank),
  ...options
}) {
  const X = valueof(data, location);
  const Y = valueof(data, value);
  const Z = valueof(data, z);
  const R = maybeRank(rank, data, X, Y, Z);
  const n = data.length;
  const Y1 = new Float64Array(n);
  const Y2 = new Float64Array(n);
  
  const transform = (_, facets) => {
    sort = maybeSort(sort);
    const I = range(n);
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
      for (const [x, stack] of stacks) {
        for (const i of stack) {
          const v = +Y[i];
          const [Y0, ceil, floor] = v < 0 ? [Yn, Y1, Y2] : [Yp, Y2, Y1];
          const y1 = floor[i] = Y0.has(x) ? Y0.get(x) : 0;
          const y2 = ceil[i] = y1 + +Y[i];
          Y0.set(x, isNaN(y2) ? y1 : y2);
        }
      }

      // offset
      if (offset === "expand") {
        for (const i of index) {
          const x = X[i];
          const floor = Yn.has(x) ? Yn.get(x) : 0;
          const ceil = Yp.has(x) ? Yp.get(x) : 0;
          const m = 1 / (ceil - floor || 1);
          Y1[i] = m * (-floor + Y1[i]);
          Y2[i] = m * (-floor + Y2[i]);
        }
      }
      if (offset === "silhouette") {
        for (const i of index) {
          const x = X[i];
          const floor = Yn.has(x) ? Yn.get(x) : 0;
          const ceil = Yp.has(x) ? Yp.get(x) : 0;
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
    location: maybeLabel(X, location),
    value: maybeLabel(Y, value),
    low: maybeLabel(Y1, value),
    high: maybeLabel(Y2, value),
    mid: maybeLabel((_,i) => (Y1[i] + Y2[i]) / 2, value),
    rank: maybeLabel(R, rank),
    z: maybeLabel(Z, z)
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
