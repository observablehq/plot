import {InternMap, ascending, cumsum, group, groupSort, greatest, rollup, sum} from "d3-array";
import {field, maybeColor, range, valueof} from "../mark.js";

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
  offset,
  order,
  reverse
}) {
  if (z === undefined && ([fill] = maybeColor(fill), fill != null)) z = fill;
  if (z === undefined && ([stroke] = maybeColor(stroke), stroke != null)) z = stroke;
  const [X, setX] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  offset = maybeOffset(offset);
  order = order === undefined && offset === offsetWiggle ? orderInsideOut : maybeOrder(order, offset);
  return [
    (data, facets) => {
      const I = range(data);
      const X = x == null ? [] : setX(valueof(data, x));
      const Y = valueof(data, y);
      const Z = valueof(data, z);
      const n = data.length;
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));
      for (const index of facets === undefined ? [I] : facets) {
        const stacks = Array.from(group(index, i => X[i]).values());
        if (order) applyOrder(stacks, order(data, I, X, Y, Z));
        for (const stack of stacks) {
          let yn = 0, yp = 0;
          if (reverse) stack.reverse();
          for (const i of stack) {
            const y = +Y[i];
            if (y < 0) yn = Y2[i] = (Y1[i] = yn) + y;
            else if (y > 0) yp = Y2[i] = (Y1[i] = yp) + y;
            else Y2[i] = Y1[i] = yp; // NaN or zero
          }
        }
        if (offset) offset(stacks, Y1, Y2, Z);
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

function maybeOffset(offset) {
  if (offset == null) return;
  switch ((offset + "").toLowerCase()) {
    case "expand": return offsetExpand;
    case "silhouette": return offsetSilhouette;
    case "wiggle": return offsetWiggle;
  }
  throw new Error(`unknown offset: ${offset}`);
}

// Given a single stack, returns the minimum and maximum values from the given
// Y2 column. Note that this relies on Y2 always being the outer column for
// diverging values.
function extent(stack, Y2) {
  let min = 0, max = 0;
  for (const i of stack) {
    const y = Y2[i];
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return [min, max];
}

function offsetExpand(stacks, Y1, Y2) {
  for (const stack of stacks) {
    const [yn, yp] = extent(stack, Y2);
    for (const i of stack) {
      const m = 1 / (yp - yn || 1);
      Y1[i] = m * (Y1[i] - yn);
      Y2[i] = m * (Y2[i] - yn);
    }
  }
}

function offsetSilhouette(stacks, Y1, Y2) {
  for (const stack of stacks) {
    const [yn, yp] = extent(stack, Y2);
    for (const i of stack) {
      const m = (yp + yn) / 2;
      Y1[i] -= m;
      Y2[i] -= m;
    }
  }
}

function offsetWiggle(stacks, Y1, Y2, Z) {
  const prev = new InternMap();
  let y = 0;
  for (const stack of stacks) {
    let j = -1;
    const Fi = stack.map(i => Math.abs(Y2[i] - Y1[i]));
    const Df = stack.map(i => {
      j = Z ? Z[i] : ++j;
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

function maybeOrder(order) {
  if (order == null) return;
  if (typeof order === "string") {
    switch (order.toLowerCase()) {
     case "sum": return orderSum;
     case "value": return orderY;
     case "appearance": return orderAppearance;
     case "inside-out": return orderInsideOut;
    }
    return orderFunction(field(order));
  }
  if (typeof order === "function") return orderFunction(order);
  return orderZDomain(order);
}

// by sum of value (a.k.a. “ascending”)
function orderSum(data, I, X, Y, Z) {
  return orderZ(Z, groupSort(I, I => sum(I, i => Y[i]), i => Z[i]));
}

// by value
function orderY(data, I, X, Y) {
  return Y;
}

// by x = argmax of value
function orderAppearance(data, I, X, Y, Z) {
  return orderZ(Z, groupSort(I, I => X[greatest(I, i => Y[i])], i => Z[i]));
}

// by x = argmax of value, but rearranged inside-out by alternating series
// according to the sign of a running divergence of sums
function orderInsideOut(data, I, X, Y, Z) {
  const K = groupSort(I, I => X[greatest(I, i => Y[i])], i => Z[i]);
  const sums = rollup(I, I => sum(I, i => Y[i]), i => Z[i]);
  const Kp = [], Kn = [];
  let s = 0;
  for (const k of K) {
    if (s < 0) {
      s += sums.get(k);
      Kp.push(k);
    } else {
      s -= sums.get(k);
      Kn.push(k);
    }
  }
  return orderZ(Z, Kn.reverse().concat(Kp));
}

function orderFunction(f) {
  return data => valueof(data, f);
}

function orderZDomain(domain) {
  return (data, I, X, Y, Z) => orderZ(Z, domain);
}

// Given an explicit ordering of distinct values in z, returns a parallel column
// O that can be used with applyOrder to sort stacks. Note that this is a series
// order: it will be consistent across stacks.
function orderZ(Z, domain) {
  domain = new InternMap(domain.map((d, i) => [d, i]));
  return Z.map(z => domain.get(z));
}

function applyOrder(stacks, O) {
  for (const stack of stacks) {
    stack.sort((i, j) => ascending(O[i], O[j]));
  }
}
