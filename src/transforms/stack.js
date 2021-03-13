import {InternMap, cumsum, group, groupSort, greatest, rollup, sum} from "d3";
import {ascendingDefined} from "../defined.js";
import {field, lazyChannel, maybeTransform, maybeLazyChannel, maybeZ, mid, range, valueof} from "../mark.js";

export function stackX({y1, y = y1, x, ...options} = {}) {
  const [transform, Y, x1, x2] = stack(y, x, "x", options);
  return {y1, y: Y, x1, x2, ...transform};
}

export function stackX1({y1, y = y1, x, ...options} = {}) {
  const [transform, Y, X] = stack(y, x, "x", options);
  return {y1, y: Y, x: X, ...transform};
}

export function stackX2({y1, y = y1, x, ...options} = {}) {
  const [transform, Y,, X] = stack(y, x, "x", options);
  return {y1, y: Y, x: X, ...transform};
}

export function stackXMid({y1, y = y1, x, ...options} = {}) {
  const [transform, Y, X1, X2] = stack(y, x, "x", options);
  return {y1, y: Y, x: mid(X1, X2), ...transform};
}

export function stackY({x1, x = x1, y, ...options} = {}) {
  const [transform, X, y1, y2] = stack(x, y, "y", options);
  return {x1, x: X, y1, y2, ...transform};
}

export function stackY1({x1, x = x1, y, ...options} = {}) {
  const [transform, X, Y] = stack(x, y, "y", options);
  return {x1, x: X, y: Y, ...transform};
}

export function stackY2({x1, x = x1, y, ...options} = {}) {
  const [transform, X,, Y] = stack(x, y, "y", options);
  return {x1, x: X, y: Y, ...transform};
}

export function stackYMid({x1, x = x1, y, ...options} = {}) {
  const [transform, X, Y1, Y2] = stack(x, y, "y", options);
  return {x1, x: X, y: mid(Y1, Y2), ...transform};
}

function stack(x, y = () => 1, ky, {offset, order, reverse, ...options} = {}) {
  const z = maybeZ(options);
  const [X, setX] = maybeLazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  offset = maybeOffset(offset);
  order = maybeOrder(order, offset, ky);
  return [
    {
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const X = x == null ? undefined : setX(valueof(data, x));
        const Y = valueof(data, y, Float64Array);
        const Z = valueof(data, z);
        const O = order && order(data, X, Y, Z);
        const n = data.length;
        const Y1 = setY1(new Float64Array(n));
        const Y2 = setY2(new Float64Array(n));
        for (const facet of facets) {
          const stacks = X ? Array.from(group(facet, i => X[i]).values()) : [facet];
          if (O) applyOrder(stacks, O);
          for (const stack of stacks) {
            let yn = 0, yp = 0;
            if (reverse) stack.reverse();
            for (const i of stack) {
              const y = Y[i];
              if (y < 0) yn = Y2[i] = (Y1[i] = yn) + y;
              else if (y > 0) yp = Y2[i] = (Y1[i] = yp) + y;
              else Y2[i] = Y1[i] = yp; // NaN or zero
            }
          }
          if (offset) offset(stacks, Y1, Y2, Z);
        }
        return {data, facets};
      })
    },
    X,
    Y1,
    Y2
  ];
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

function maybeOrder(order, offset, ky) {
  if (order === undefined && offset === offsetWiggle) return orderInsideOut;
  if (order == null) return;
  if (typeof order === "string") {
    switch (order.toLowerCase()) {
      case "value": case ky: return orderY;
      case "z": return orderZ;
      case "sum": return orderSum;
      case "appearance": return orderAppearance;
      case "inside-out": return orderInsideOut;
    }
    return orderFunction(field(order));
  }
  if (typeof order === "function") return orderFunction(order);
  return orderGiven(order);
}

// by value
function orderY(data, X, Y) {
  return Y;
}

// by location
function orderZ(order, X, Y, Z) {
  return Z;
}

// by sum of value (a.k.a. “ascending”)
function orderSum(data, X, Y, Z) {
  return orderZDomain(Z, groupSort(range(data), I => sum(I, i => Y[i]), i => Z[i]));
}

// by x = argmax of value
function orderAppearance(data, X, Y, Z) {
  return orderZDomain(Z, groupSort(range(data), I => X[greatest(I, i => Y[i])], i => Z[i]));
}

// by x = argmax of value, but rearranged inside-out by alternating series
// according to the sign of a running divergence of sums
function orderInsideOut(data, X, Y, Z) {
  const I = range(data);
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
  return orderZDomain(Z, Kn.reverse().concat(Kp));
}

function orderFunction(f) {
  return data => valueof(data, f);
}

function orderGiven(domain) {
  return (data, X, Y, Z) => orderZDomain(Z, domain);
}

// Given an explicit ordering of distinct values in z, returns a parallel column
// O that can be used with applyOrder to sort stacks. Note that this is a series
// order: it will be consistent across stacks.
function orderZDomain(Z, domain) {
  domain = new InternMap(domain.map((d, i) => [d, i]));
  return Z.map(z => domain.get(z));
}

function applyOrder(stacks, O) {
  for (const stack of stacks) {
    stack.sort((i, j) => ascendingDefined(O[i], O[j]));
  }
}
