import {InternMap, cumsum, group, groupSort, greatest, max, min, rollup, sum} from "d3";
import {ascendingDefined} from "../defined.js";
import {field, channel, maybeChannel, maybeZ, mid, range, valueof, maybeZero} from "../options.js";
import {basic} from "./basic.js";

export function stackX(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {y1, y = y1, x, ...rest} = options; // note: consumes x!
  const [transform, Y, x1, x2] = stack(y, x, "x", stackOptions, rest);
  return {...transform, y1, y: Y, x1, x2, x: mid(x1, x2)};
}

export function stackX1(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {y1, y = y1, x} = options;
  const [transform, Y, X] = stack(y, x, "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackX2(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {y1, y = y1, x} = options;
  const [transform, Y,, X] = stack(y, x, "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackY(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {x1, x = x1, y, ...rest} = options; // note: consumes y!
  const [transform, X, y1, y2] = stack(x, y, "y", stackOptions, rest);
  return {...transform, x1, x: X, y1, y2, y: mid(y1, y2)};
}

export function stackY1(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {x1, x = x1, y} = options;
  const [transform, X, Y] = stack(x, y, "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function stackY2(stackOptions = {}, options = {}) {
  if (arguments.length === 1) ([stackOptions, options] = mergeOptions(stackOptions));
  const {x1, x = x1, y} = options;
  const [transform, X,, Y] = stack(x, y, "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function maybeStackX({x, x1, x2, ...options} = {}) {
  if (x1 === undefined && x2 === undefined) return stackX({x, ...options});
  ([x1, x2] = maybeZero(x, x1, x2));
  return {...options, x1, x2};
}

export function maybeStackY({y, y1, y2, ...options} = {}) {
  if (y1 === undefined && y2 === undefined) return stackY({y, ...options});
  ([y1, y2] = maybeZero(y, y1, y2));
  return {...options, y1, y2};
}

// The reverse option is ambiguous: it is both a stack option and a basic
// transform. If only one options object is specified, we interpret it as a
// stack option, and therefore must remove it from the propagated options.
function mergeOptions(options) {
  const {offset, order, reverse, ...rest} = options;
  return [{offset, order, reverse}, rest];
}

function stack(x, y = () => 1, ky, {offset, order, reverse}, options) {
  const z = maybeZ(options);
  const [X, setX] = maybeChannel(x);
  const [Y1, setY1] = channel(y);
  const [Y2, setY2] = channel(y);
  offset = maybeOffset(offset);
  order = maybeOrder(order, offset, ky);
  return [
    basic(options, (data, facets) => {
      const X = x == null ? undefined : setX(valueof(data, x));
      const Y = valueof(data, y, Float64Array);
      const Z = valueof(data, z);
      const O = order && order(data, X, Y, Z);
      const n = data.length;
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));
      const facetstacks = [];
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
        facetstacks.push(stacks);
      }
      if (offset) offset(facetstacks, Y1, Y2, Z);
      return {data, facets};
    }),
    X,
    Y1,
    Y2
  ];
}

function maybeOffset(offset) {
  if (offset == null) return;
  switch (`${offset}`.toLowerCase()) {
    case "expand": case "normalize": return offsetExpand;
    case "center": case "silhouette": return offsetCenter;
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

function offsetExpand(facetstacks, Y1, Y2) {
  for (const stacks of facetstacks) {
    for (const stack of stacks) {
      const [yn, yp] = extent(stack, Y2);
      for (const i of stack) {
        const m = 1 / (yp - yn || 1);
        Y1[i] = m * (Y1[i] - yn);
        Y2[i] = m * (Y2[i] - yn);
      }
    }
  }
}

function offsetCenter(facetstacks, Y1, Y2) {
  for (const stacks of facetstacks) {
    for (const stack of stacks) {
      const [yn, yp] = extent(stack, Y2);
      for (const i of stack) {
        const m = (yp + yn) / 2;
        Y1[i] -= m;
        Y2[i] -= m;
      }
    }
    offsetZero(stacks, Y1, Y2);
  }
  offsetCenterFacets(facetstacks, Y1, Y2);
}

function offsetWiggle(facetstacks, Y1, Y2, Z) {
  for (const stacks of facetstacks) {
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
    offsetZero(stacks, Y1, Y2);
  }
  offsetCenterFacets(facetstacks, Y1, Y2);
}

function offsetZero(stacks, Y1, Y2) {
  const m = min(stacks, stack => min(stack, i => Y1[i]));
  for (const stack of stacks) {
    for (const i of stack) {
      Y1[i] -= m;
      Y2[i] -= m;
    }
  }
}

function offsetCenterFacets(facetstacks, Y1, Y2) {
  const n = facetstacks.length;
  if (n === 1) return;
  const facets = facetstacks.map(stacks => stacks.flat());
  const m = facets.map(I => (min(I, i => Y1[i]) + max(I, i => Y2[i])) / 2);
  const m0 = min(m);
  for (let j = 0; j < n; j++) {
    const p = m0 - m[j];
    for (const i of facets[j]) {
      Y1[i] += p;
      Y2[i] += p;
    }
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
  if (Array.isArray(order)) return orderGiven(order);
  throw new Error("invalid order");
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
