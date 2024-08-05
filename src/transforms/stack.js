import {InternMap, cumsum, greatest, group, groupSort, max, min, rollup, sum} from "d3";
import {ascendingDefined, descendingDefined} from "../defined.js";
import {withTip} from "../mark.js";
import {maybeApplyInterval, maybeColumn, maybeZ, maybeZero} from "../options.js";
import {column, field, isArray, lengthof, mid, one, range, valueof} from "../options.js";
import {basic} from "./basic.js";
import {exclusiveFacets} from "./exclusiveFacets.js";

export function stackX(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {y1, y = y1, x, ...rest} = options; // note: consumes x!
  const [transform, Y, x1, x2] = stack(y, x, "y", "x", stackOptions, rest);
  return {...transform, y1, y: Y, x1, x2, x: mid(x1, x2)};
}

export function stackX1(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {y1, y = y1, x} = options;
  const [transform, Y, X] = stack(y, x, "y", "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackX2(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {y1, y = y1, x} = options;
  const [transform, Y, , X] = stack(y, x, "y", "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackY(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {x1, x = x1, y, ...rest} = options; // note: consumes y!
  const [transform, X, y1, y2] = stack(x, y, "x", "y", stackOptions, rest);
  return {...transform, x1, x: X, y1, y2, y: mid(y1, y2)};
}

export function stackY1(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {x1, x = x1, y} = options;
  const [transform, X, Y] = stack(x, y, "x", "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function stackY2(stackOptions = {}, options = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {x1, x = x1, y} = options;
  const [transform, X, , Y] = stack(x, y, "x", "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function maybeStackX({x, x1, x2, ...options} = {}) {
  options = withTip(options, "y");
  if (x1 === undefined && x2 === undefined) return stackX({x, ...options});
  [x1, x2] = maybeZero(x, x1, x2);
  return {...options, x1, x2};
}

export function maybeStackY({y, y1, y2, ...options} = {}) {
  options = withTip(options, "x");
  if (y1 === undefined && y2 === undefined) return stackY({y, ...options});
  [y1, y2] = maybeZero(y, y1, y2);
  return {...options, y1, y2};
}

// The reverse option is ambiguous: it is both a stack option and a basic
// transform. If only one options object is specified, we interpret it as a
// stack option, and therefore must remove it from the propagated options.
function mergeOptions(options) {
  const {offset, order, reverse, ...rest} = options;
  return [{offset, order, reverse}, rest];
}

// This is a hint to the tooltip mark that the y1 and y2 channels (for stackY,
// or conversely x1 and x2 for stackX) represent a stacked length, and that the
// tooltip should therefore show y2-y1 instead of an extent.
const lengthy = {length: true};

function stack(x, y = one, kx, ky, {offset, order, reverse}, options) {
  if (y === null) throw new Error(`stack requires ${ky}`);
  const z = maybeZ(options);
  const [X, setX] = maybeColumn(x);
  const [Y1, setY1] = column(y);
  const [Y2, setY2] = column(y);
  Y1.hint = Y2.hint = lengthy;
  offset = maybeOffset(offset);
  order = maybeOrder(order, offset, ky);
  return [
    basic(options, (data, facets, plotOptions) => {
      ({data, facets} = exclusiveFacets(data, facets));
      const X = x == null ? undefined : setX(maybeApplyInterval(valueof(data, x), plotOptions?.[kx]));
      const Y = valueof(data, y, Float64Array);
      const Z = valueof(data, z);
      const compare = order && order(data, X, Y, Z);
      const n = lengthof(data);
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));
      const facetstacks = [];
      for (const facet of facets) {
        const stacks = X ? Array.from(group(facet, (i) => X[i]).values()) : [facet];
        if (compare) for (const stack of stacks) stack.sort(compare);
        for (const stack of stacks) {
          let yn = 0;
          let yp = 0;
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
  if (typeof offset === "function") return offset;
  switch (`${offset}`.toLowerCase()) {
    case "expand":
    case "normalize":
      return offsetExpand;
    case "center":
    case "silhouette":
      return offsetCenter;
    case "wiggle":
      return offsetWiggle;
  }
  throw new Error(`unknown offset: ${offset}`);
}

// Given a single stack, returns the minimum and maximum values from the given
// Y2 column. Note that this relies on Y2 always being the outer column for
// diverging values.
function extent(stack, Y2) {
  let min = 0,
    max = 0;
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
      const Fi = stack.map((i) => Math.abs(Y2[i] - Y1[i]));
      const Df = stack.map((i) => {
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
  const m = min(stacks, (stack) => min(stack, (i) => Y1[i]));
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
  const facets = facetstacks.map((stacks) => stacks.flat());
  const m = facets.map((I) => (min(I, (i) => Y1[i]) + max(I, (i) => Y2[i])) / 2);
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
  if (order === undefined && offset === offsetWiggle) return orderInsideOut(ascendingDefined);
  if (order == null) return;
  if (typeof order === "string") {
    const negate = order.startsWith("-");
    const compare = negate ? descendingDefined : ascendingDefined;
    switch ((negate ? order.slice(1) : order).toLowerCase()) {
      case "value":
      case ky:
        return orderY(compare);
      case "z":
        return orderZ(compare);
      case "sum":
        return orderSum(compare);
      case "appearance":
        return orderAppearance(compare);
      case "inside-out":
        return orderInsideOut(compare);
    }
    return orderAccessor(field(order));
  }
  if (typeof order === "function") return (order.length === 1 ? orderAccessor : orderComparator)(order);
  if (isArray(order)) return orderGiven(order);
  throw new Error(`invalid order: ${order}`);
}

// by value
function orderY(compare) {
  return (data, X, Y) => (i, j) => compare(Y[i], Y[j]);
}

// by location
function orderZ(compare) {
  return (data, X, Y, Z) => (i, j) => compare(Z[i], Z[j]);
}

// by sum of value (a.k.a. “ascending”)
function orderSum(compare) {
  return orderZDomain(compare, (data, X, Y, Z) =>
    groupSort(
      range(data),
      (I) => sum(I, (i) => Y[i]),
      (i) => Z[i]
    )
  );
}

// by x = argmax of value
function orderAppearance(compare) {
  return orderZDomain(compare, (data, X, Y, Z) =>
    groupSort(
      range(data),
      (I) => X[greatest(I, (i) => Y[i])],
      (i) => Z[i]
    )
  );
}

// by x = argmax of value, but rearranged inside-out by alternating series
// according to the sign of a running divergence of sums
function orderInsideOut(compare) {
  return orderZDomain(compare, (data, X, Y, Z) => {
    const I = range(data);
    const K = groupSort(
      I,
      (I) => X[greatest(I, (i) => Y[i])],
      (i) => Z[i]
    );
    const sums = rollup(
      I,
      (I) => sum(I, (i) => Y[i]),
      (i) => Z[i]
    );
    const Kp = [],
      Kn = [];
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
    return Kn.reverse().concat(Kp);
  });
}

function orderAccessor(f) {
  return (data) => {
    const O = valueof(data, f);
    return (i, j) => ascendingDefined(O[i], O[j]);
  };
}

function orderComparator(f) {
  return (data) => {
    return isArray(data) ? (i, j) => f(data[i], data[j]) : (i, j) => f(data.get(i), data.get(j));
  };
}

function orderGiven(domain) {
  return orderZDomain(ascendingDefined, () => domain);
}

// Given an ordering (domain) of distinct values in z that can be derived from
// the data, returns a comparator that can be used to sort stacks. Note that
// this is a series order: it will be consistent across stacks.
function orderZDomain(compare, domain) {
  return (data, X, Y, Z) => {
    if (!Z) throw new Error("missing channel: z");
    const map = new InternMap(domain(data, X, Y, Z).map((d, i) => [d, i]));
    return (i, j) => compare(map.get(Z[i]), map.get(Z[j]));
  };
}
