import {InternMap, ascending, cumsum, descending, group, groupSort, maxIndex, range, rollup, sum} from "d3-array";
import {field, maybeSort, take, valueof} from "../mark.js";

export function stackX({x, y, ...options}) {
  const [transform, Y, x1, x2] = stack(y, x, options);
  return {...options, transform, y: Y, x1, x2};
}

export function stackX1({x, y, ...options}) {
  const [transform, Y, X] = stack(y, x, options);
  return {...options, transform, y: Y, x: X};
}

export function stackX2({x, y, ...options}) {
  const [transform, Y,, X] = stack(y, x, options);
  return {...options, transform, y: Y, x: X};
}

export function stackXMid({x, y, ...options}) {
  const [transform, Y, X1, X2] = stack(y, x, options);
  return {...options, transform, y: Y, x: mid(X1, X2)};
}

export function stackY({x, y, ...options}) {
  const [transform, X, y1, y2] = stack(x, y, options);
  return {...options, transform, x: X, y1, y2};
}

export function stackY1({x, y, ...options}) {
  const [transform, X, Y] = stack(x, y, options);
  return {...options, transform, x: X, y: Y};
}

export function stackY2({x, y, ...options}) {
  const [transform, X,, Y] = stack(x, y, options);
  return {...options, transform, x: X, y: Y};
}

export function stackYMid({x, y, ...options}) {
  const [transform, X, Y1, Y2] = stack(x, y, options);
  return {...options, transform, x: X, y: mid(Y1, Y2)};
}

function stack(x, y = () => 1, {
  z,
  fill,
  stroke,
  title,
  rank,
  reverse = ["descending", "reverse"].includes(rank),
  offset,
  sort
}) {
  const [X, setX] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  sort = maybeSort(sort);
  return [
    (data, facets) => {
      const X = setX(valueof(data, x));
      const Y = valueof(data, y);
      const Z = valueof(data, z || fill || stroke || title);
      const R = maybeRank(rank, data, X, Y, Z);
      const n = data.length;
      const I = range(n);
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));

      for (const index of facets === undefined ? [I] : facets) {

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
        } else if (reverse) {
          for (const [, stack] of stacks) stack.reverse();
        }

        // stack
        for (const [x, stack] of stacks) {
          for (const i of stack) {
            const v = +Y[i];
            const Y0 = v < 0 ? Yn : Yp;
            const y1 = Y1[i] = Y0.has(x) ? Y0.get(x) : 0;
            const y2 = Y2[i] = y1 + +Y[i];
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
        } else if (offset === "silhouette") {
          for (const i of index) {
            const x = X[i];
            const floor = Yn.has(x) ? Yn.get(x) : 0;
            const ceil = Yp.has(x) ? Yp.get(x) : 0;
            const m = (ceil + floor) / 2;
            Y1[i] -= m;
            Y2[i] -= m;
          }
        } else if (offset === "wiggle") {
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
    },
    X,
    Y1,
    Y2
  ];
}

// Defines a channel whose values are lazily populated by calling the returned
// setter. If the given source is labeled, the label is propagated to the
// returned channel definition.
function lazyChannel(source) {
  let value;
  return [
    {
      transform: () => value,
      label: typeof source === "string" ? source
        : source ? source.label
        : undefined
    },
    v => value = v
  ];
}

// Assuming that both x1 and x2 and lazy channels (per above), this derives a
// new a channel that’s the average of the two, and which inherits the channel
// label (if any).
function mid(x1, x2) {
  return {
    transform() {
      const X1 = x1.transform();
      const X2 = x2.transform();
      return Float64Array.from(X1, (_, i) => (X1[i] + X2[i]) / 2);
    },
    label: x1.label
  };
}

// well-known ranking strategies by series
function maybeRank(rank, data, X, Y, Z) {
  if (rank == null) return;

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
