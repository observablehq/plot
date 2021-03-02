import {InternMap, ascending, cumsum, descending, group, groupSort, greatest, rollup, sum} from "d3-array";
import {field, range, valueof} from "../mark.js";

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
  offset,
  rank = offset === "wiggle" ? "inside-out" : undefined,
  reverse
}) {
  const [X, setX] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  return [
    (data, facets) => {
      const X = x == null ? [] : setX(valueof(data, x));
      const Y = valueof(data, y);
      const Z = valueof(data, z || fill || stroke || title);
      const n = data.length;
      const I = range(data);
      const R = maybeRank(rank, data, I, X, Y, Z);
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));

      for (const index of facets === undefined ? [I] : facets) {
        const Yp = new InternMap();
        const Yn = new InternMap();
        const stacks = group(index, i => X[i]);

        // rank
        if (R) {
          const a = reverse ? descending : ascending;
          for (const stack of stacks.values()) stack.sort((i, j) => a(R[i], R[j]));
        } else if (reverse) {
          for (const stack of stacks.values()) stack.reverse();
        }

        // stack
        for (const [x, stack] of stacks) {
          let yn = 0, yp = 0;
          for (const i of stack) {
            const y = +Y[i];
            if (y < 0) yn = Y2[i] = (Y1[i] = yn) + y;
            else if (y > 0) yp = Y2[i] = (Y1[i] = yp) + y;
            else Y2[i] = Y1[i] = yp; // NaN or zero
          }
          Yn.set(x, yn);
          Yp.set(x, yp);
        }

        // offset
        if (offset === "expand") {
          for (const i of index) {
            const x = X[i];
            const yn = Yn.get(x);
            const yp = Yp.get(x);
            const m = 1 / (yp - yn || 1);
            Y1[i] = m * (Y1[i] - yn);
            Y2[i] = m * (Y2[i] - yn);
          }
        } else if (offset === "silhouette") {
          for (const i of index) {
            const x = X[i];
            const yn = Yn.get(x);
            const yp = Yp.get(x);
            const m = (yp + yn) / 2;
            Y1[i] -= m;
            Y2[i] -= m;
          }
        } else if (offset === "wiggle") {
          const prev = new InternMap();
          let y = 0;
          for (const stack of stacks.values()) {
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
    x == null ? x : X,
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
function maybeRank(rank, data, I, X, Y, Z) {
  if (rank == null) return;

  // either a well-known ranking method, or a field name
  if (typeof rank === "string") {

    // by sum of value (a.k.a. “ascending”)
    if (rank === "sum") {
      const S = groupSort(I, g => sum(g, i => Y[i]), i => Z[i]);
      return positions(Z, S);
    }

    // by value
    if (rank === "value") return Y;

    // by x = argmax of value
    if (rank === "appearance") {
      const K = groupSort(I, I => X[greatest(I, i => Y[i])], i => Z[i]);
      return positions(Z, K);
    }

    // by x = argmax of value, but rearranged inside-out by alternating series
    // according to the sign of a running divergence of sums
    if (rank === "inside-out") {
      const K = groupSort(I, I => X[greatest(I, i => Y[i])], i => Z[i]);
      const sums = rollup(I, I => sum(I, i => Y[i]), i => Z[i]);
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
      return positions(Z, order);
    }

    // any other string is a field accessor
    return valueof(data, field(rank));
  }

  // a generic function
  if (typeof rank === "function") {
    return valueof(data, rank);
  }

  // an array or iterable of z (particularly useful with groupSort)
  return positions(Z, rank);
}

// returns the positions of each element of A in B, -1 if not found
function positions(A, B) {
  B = new Map(Array.from(B, (d, i) => [d, i + 1]));
  return A.map(d => (B.get(d) || 0) - 1);
}
