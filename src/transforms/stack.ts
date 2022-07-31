/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {MarkOptions, OffsetFunction, StackOrder} from "../api.js";
import type {DataArray, Datum, index, Series, Value, ValueArray} from "../data.js";
import type {GetColumn, Accessor} from "../options.js";

import {InternMap, cumsum, group, groupSort, greatest, max, min, rollup, sum} from "d3";
import {ascendingDefined} from "../defined.js";
import {field, column, maybeColumn, maybeZ, mid, range, valueof, maybeZero, one} from "../options.js";
import {basic} from "./basic.js";

export function stackX<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {y1, y = y1, x, ...rest} = options; // note: consumes x!
  const [transform, Y, x1, x2] = stack<T>(y, x, "x", stackOptions, rest);
  return {...transform, y1, y: Y, x1, x2, x: mid(x1, x2)};
}

export function stackX1<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions<T>(stackOptions);
  const {y1, y = y1, x} = options;
  const [transform, Y, X] = stack(y, x, "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackX2<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions<T>(stackOptions);
  const {y1, y = y1, x} = options;
  const [transform, Y, , X] = stack(y, x, "x", stackOptions, options);
  return {...transform, y1, y: Y, x: X};
}

export function stackY<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions<T>(stackOptions);
  const {x1, x = x1, y, ...rest} = options; // note: consumes y!
  const [transform, X, y1, y2] = stack(x, y, "y", stackOptions, rest);
  return {...transform, x1, x: X, y1, y2, y: mid(y1, y2)};
}

export function stackY1<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions<T>(stackOptions);
  const {x1, x = x1, y} = options;
  const [transform, X, Y] = stack(x, y, "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function stackY2<T extends Datum>(stackOptions: MarkOptions<T> = {}, options: MarkOptions<T> = {}) {
  if (arguments.length === 1) [stackOptions, options] = mergeOptions(stackOptions);
  const {x1, x = x1, y} = options;
  const [transform, X, , Y] = stack(x, y, "y", stackOptions, options);
  return {...transform, x1, x: X, y: Y};
}

export function maybeStackX<T extends Datum>({x, x1, x2, ...options}: MarkOptions<T> = {}) {
  if (x1 === undefined && x2 === undefined) return stackX({x, ...options});
  const [x1b, x2b] = maybeZero(x, x1, x2);
  return {...options, x1: x1b, x2: x2b};
}

export function maybeStackY<T extends Datum>({y, y1, y2, ...options}: MarkOptions<T> = {}) {
  if (y1 === undefined && y2 === undefined) return stackY({y, ...options});
  const [y1b, y2b] = maybeZero(y, y1, y2);
  return {...options, y1: y1b, y2: y2b};
}

// The reverse option is ambiguous: it is both a stack option and a basic
// transform. If only one options object is specified, we interpret it as a
// stack option, and therefore must remove it from the propagated options.
function mergeOptions<T extends Datum>(options: MarkOptions<T>) {
  const {offset, order, reverse, ...rest} = options;
  return [{offset, order, reverse}, rest];
}

function stack<T extends Datum>(
  x: Accessor<T> | number | undefined,
  y: Accessor<T> | number = one,
  ky: string,
  {offset: offset0, order: order0, reverse}: MarkOptions<T>,
  options: MarkOptions<T>
): [MarkOptions<T>, GetColumn | null | undefined, GetColumn, GetColumn] {
  if (y === null) throw new Error(`null channel ${ky}`);
  const z = maybeZ(options);
  const [X, setX] = maybeColumn(x);
  const [Y1, setY1] = column(y);
  const [Y2, setY2] = column(y);
  const offset = maybeOffset(offset0);
  const order = maybeOrder(order0, offset, ky);
  return [
    basic(options, (data, facets) => {
      const X = x == null ? undefined : setX!(valueof(data, x)!);
      const Y = valueof(data, y, Float64Array) as Float64Array; // TODO
      const Z = valueof(data, z);
      const O = order && order(data, X, Y, Z);
      const n = data.length;
      const Y1 = setY1(new Float64Array(n));
      const Y2 = setY2(new Float64Array(n));
      const facetstacks = [];
      for (const facet of facets) {
        const stacks = X ? Array.from(group(facet, (i) => X[i]).values()) : [facet];
        if (O) applyOrder(stacks, O);
        for (const stack of stacks) {
          let yn = 0,
            yp = 0;
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

function maybeOffset(offset: string | OffsetFunction | null | undefined) {
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
function extent(stack: Series, Y2: Float64Array) {
  let min = 0,
    max = 0;
  for (const i of stack) {
    const y = Y2[i];
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return [min, max];
}

function offsetExpand(facetstacks: Series[][], Y1: Float64Array, Y2: Float64Array) {
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

function offsetCenter(facetstacks: Series[][], Y1: Float64Array, Y2: Float64Array) {
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

function offsetWiggle(facetstacks: Series[][], Y1: Float64Array, Y2: Float64Array, Z: ValueArray | null | undefined) {
  for (const stacks of facetstacks) {
    const prev = new InternMap();
    let y = 0;
    for (const stack of stacks) {
      let j: Value = -1; // type: j is a number of Z is null, otherwise it's the z value
      const Fi = stack.map((i: index) => Math.abs(Y2[i] - Y1[i]));
      const Df = stack.map((i: index) => {
        j = Z ? Z[i] : ++(j as number);
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

function offsetZero(stacks: Series[], Y1: Float64Array, Y2: Float64Array) {
  const m = min(stacks, (stack) => min(stack, (i) => Y1[i])) as number;
  for (const stack of stacks) {
    for (const i of stack) {
      Y1[i] -= m;
      Y2[i] -= m;
    }
  }
}

function offsetCenterFacets(facetstacks: Series[][], Y1: Float64Array, Y2: Float64Array) {
  const n = facetstacks.length;
  if (n === 1) return;
  const facets = facetstacks.map((stacks) => stacks.flat()) as Series[];
  const m = facets.map((I) => ((min(I, (i: index) => Y1[i]) as number) + (max(I, (i: index) => Y2[i]) as number)) / 2);
  const m0 = min(m) as number;
  for (let j = 0; j < n; j++) {
    const p = m0 - m[j];
    for (const i of facets[j]) {
      Y1[i] += p;
      Y2[i] += p;
    }
  }
}

function maybeOrder<T extends Datum>(
  order: StackOrder | undefined,
  offset: OffsetFunction | undefined,
  ky: string
):
  | ((data: DataArray<T>) => ValueArray)
  | ((data: DataArray<T>, X: ValueArray | undefined, Y: Float64Array) => ValueArray)
  | ((
      data: DataArray<T>,
      X: ValueArray | undefined,
      Y: Float64Array,
      Z: ValueArray | null | undefined
    ) => ValueArray | null | undefined)
  | undefined {
  if (order === undefined && offset === offsetWiggle) return orderInsideOut;
  if (order == null) return;
  if (typeof order === "string") {
    switch (order.toLowerCase()) {
      case "value":
      case ky:
        return orderY;
      case "z":
        return orderZ;
      case "sum":
        return orderSum;
      case "appearance":
        return orderAppearance;
      case "inside-out":
        return orderInsideOut;
    }
    return orderFunction(field(order));
  }
  if (typeof order === "function") return orderFunction(order);
  if (Array.isArray(order)) return orderGiven(order);
  throw new Error(`invalid order: ${order}`);
}

// by value
function orderY<T extends Datum>(data: DataArray<T>, X: ValueArray | undefined, Y: Float64Array) {
  return Y;
}

// by location
function orderZ<T extends Datum>(
  data: DataArray<T>,
  X: ValueArray | undefined,
  Y: Float64Array,
  Z: ValueArray | null | undefined
) {
  return Z;
}

// by sum of value (a.k.a. “ascending”)
function orderSum<T extends Datum>(
  data: DataArray<T>,
  X: ValueArray | undefined,
  Y: Float64Array,
  Z?: ValueArray | null
) {
  if (Z == null) throw new Error(`missing channel: Z`);
  return orderZDomain(
    Z,
    groupSort(
      range(data),
      (I) => sum(I, (i) => Y[i]),
      (i) => Z[i]
    )
  ) as ValueArray;
}

// by x = argmax of value
function orderAppearance<T extends Datum>(
  data: DataArray<T>,
  X: ValueArray | undefined,
  Y: Float64Array,
  Z?: ValueArray | null
) {
  if (X === undefined) throw new Error(`cannot order by appearance without a base`);
  if (Z == null) throw new Error(`cannot order by appearance without a Z channel`);
  return orderZDomain(
    Z,
    groupSort(
      range(data),
      (I) => X[greatest(I, (i) => Y[i]) as index],
      (i) => Z[i]
    )
  );
}

// by x = argmax of value, but rearranged inside-out by alternating series
// according to the sign of a running divergence of sums
function orderInsideOut<T extends Datum>(
  data: DataArray<T>,
  X: ValueArray | undefined,
  Y: Float64Array,
  Z?: ValueArray | null
) {
  if (X === undefined) throw new Error(`cannot order by appearance without a base`);
  if (Z == null) throw new Error(`cannot order by appearance without a Z channel`);
  const I = range(data);
  const K = groupSort(
    I,
    (I) => X[greatest(I, (i) => Y[i]) as number],
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
      s += sums.get(k)!;
      Kp.push(k);
    } else {
      s -= sums.get(k)!;
      Kn.push(k);
    }
  }
  return orderZDomain(Z, Kn.reverse().concat(Kp));
}

function orderFunction<T extends Datum>(f: (d: T) => Value) {
  return (data: DataArray<T>) => valueof(data, f);
}

function orderGiven<T extends Datum>(domain: Value[]) {
  return (data: DataArray<T>, X: ValueArray | undefined, Y: Float64Array, Z: ValueArray | null | undefined) => {
    if (Z == null) throw new Error(`missing channel: Z`);
    return orderZDomain(Z, domain);
  };
}

// Given an explicit ordering of distinct values in z, returns a parallel column
// O that can be used with applyOrder to sort stacks. Note that this is a series
// order: it will be consistent across stacks.
function orderZDomain(Z: ValueArray, domain0: Value[]) {
  const domain = new InternMap(domain0.map((d, i) => [d, i]));
  return Z.map((z) => domain.get(z)!);
}

function applyOrder(stacks: Series[], O: ValueArray) {
  for (const stack of stacks) {
    stack.sort((i, j) => ascendingDefined(O[i], O[j]));
  }
}
