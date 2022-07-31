import type {MarkOptions, OutputOptions, BinValue} from "../api.js";
import type {DataArray, Datum, index, Series, Value} from "../data.js";
import type {Accessor, GetColumn} from "../options.js";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {bin as binner, extent, thresholdFreedmanDiaconis, thresholdScott, thresholdSturges, utcTickInterval} from "d3";
import {
  valueof,
  range,
  identity,
  maybeColumn,
  maybeTuple,
  maybeColorChannel,
  maybeValue,
  mid,
  labelof,
  isTemporal,
  isIterable
} from "../options.js";
import {coerceDate, coerceNumber} from "../scales.js";
import {basic} from "./basic.js";
import {
  hasOutput,
  maybeEvaluator,
  maybeGroup,
  maybeOutput,
  maybeOutputs,
  maybeReduce,
  maybeSort,
  maybeSubgroup,
  reduceCount,
  reduceFirst,
  reduceIdentity
} from "./group.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";
import {maybeInterval} from "./interval.js";

// Group on {z, fill, stroke}, then optionally on y, then bin x.
export function binX<T extends Datum>(outputs: OutputOptions<T> = {y: "count"}, options: MarkOptions<T> = {}) {
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = options;
  return binn(maybeBinValue(x, options, identity), null, null, y, outputs, maybeInsetX(options));
}

// Group on {z, fill, stroke}, then optionally on x, then bin y.
export function binY<T extends Datum>(outputs: OutputOptions<T> = {x: "count"}, options: MarkOptions<T> = {}) {
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = options;
  return binn(null, maybeBinValue(y, options, identity), x, null, outputs, maybeInsetY(options));
}

// Group on {z, fill, stroke}, then bin on x and y.
export function bin<T extends Datum>(outputs: OutputOptions<T> = {fill: "count"}, options: MarkOptions<T> = {}) {
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = maybeBinValueTuple(options);
  return binn(x, y, null, null, outputs, maybeInsetX(maybeInsetY(options)));
}

function maybeDenseInterval<T extends Datum>(
  bin: (outputs: OutputOptions<T>, options: MarkOptions<T>) => MarkOptions<T>,
  k: "x" | "y",
  options: MarkOptions<T> = {}
) {
  return options?.interval == null
    ? options
    : bin({[k]: options?.reduce === undefined ? reduceFirst : options.reduce, filter: null}, options);
}

export function maybeDenseIntervalX<T extends Datum>(options: MarkOptions<T>) {
  return maybeDenseInterval(binX, "y", options);
}

export function maybeDenseIntervalY<T extends Datum>(options: MarkOptions<T>) {
  return maybeDenseInterval(binY, "x", options);
}

function binn<T extends Datum>(
  bx0: BinValue<T> | null, // optionally bin on x (exclusive with gx)
  by0: BinValue<T> | null, // optionally bin on y (exclusive with gy)
  gx: number | Accessor<T> | null | undefined, // optionally group on x (exclusive with bx and gy)
  gy: number | Accessor<T> | null | undefined, // optionally group on y (exclusive with by and gx)
  {
    data: reduceData = reduceIdentity,
    filter: filter0 = reduceCount, // return only non-empty bins by default
    sort: sort0,
    reverse,
    ...outputs0 // output channel definitions
  }: OutputOptions<T> = {},
  inputs: MarkOptions<T> = {} // input channels and options
): MarkOptions<T> {
  const bx = maybeBin<T>(bx0); // TODO change name bx1 is confusing
  const by = maybeBin<T>(by0);

  // Compute the outputs.
  const outputs = maybeOutputs(outputs0, inputs);
  reduceData = maybeReduce(reduceData, identity);
  const sort = sort0 == null ? undefined : maybeOutput("sort", sort0, inputs);
  const filter = filter0 == null ? undefined : maybeEvaluator("filter", filter0, inputs);

  // Don’t group on a channel if an output requires it as an input!
  if (gx != null && hasOutput(outputs, "x", "x1", "x2")) gx = null;
  if (gy != null && hasOutput(outputs, "y", "y1", "y2")) gy = null;

  // Produce x1, x2, y1, and y2 output channels as appropriate (when binning).
  const [BX1, setBX1] = maybeColumn(bx);
  const [BX2, setBX2] = maybeColumn(bx);
  const [BY1, setBY1] = maybeColumn(by);
  const [BY2, setBY2] = maybeColumn(by);

  // Produce x or y output channels as appropriate (when grouping).
  const [k, gk]: [(number | Accessor<T> | null)?, string?] = gx != null ? [gx, "x"] : gy != null ? [gy, "y"] : [];
  const [GK, setGK] = maybeColumn(k);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once. We also want to consume options that should
  // only apply to this transform rather than passing them through to the next.
  const {
    x,
    y,
    z,
    fill,
    stroke,
    x1,
    x2, // consumed if x is an output
    y1,
    y2, // consumed if y is an output
    domain,
    cumulative,
    thresholds,
    interval,
    ...options
  } = inputs;
  const [GZ, setGZ] = maybeColumn(z);
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  const [GF, setGF] = maybeColumn(vfill);
  const [GS, setGS] = maybeColumn(vstroke);

  return {
    ...("z" in inputs && {z: GZ || z}),
    ...("fill" in inputs && {fill: GF || fill}),
    ...("stroke" in inputs && {stroke: GS || stroke}),
    ...basic(options, (data, facets) => {
      const K = valueof(data, k);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S});
      const groupFacets = [];
      const groupData = [];
      const GK = K && (setGK!([]) as Value[]); // For .push; TODO: type setColumn?
      const GZ = Z && (setGZ!([]) as Value[]);
      const GF = F && (setGF!([]) as Value[]);
      const GS = S && (setGS!([]) as Value[]);
      const BX = bx ? bx(data) : ([[, , (I: Series) => I]] as [BinFilter]);
      const BY = by ? by(data) : ([[, , (I: Series) => I]] as [BinFilter]);
      const BX1 = bx && (setBX1!([]) as Value[]);
      const BX2 = bx && (setBX2!([]) as Value[]);
      const BY1 = by && (setBY1!([]) as Value[]);
      const BY2 = by && (setBY2!([]) as Value[]);
      let i = 0;
      for (const o of outputs) o.initialize(data);
      if (sort) sort.initialize(data);
      if (filter) filter.initialize(data);
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        if (sort) sort.scope("facet", facet);
        if (filter) filter.scope("facet", facet);
        for (const [f, I] of maybeGroup(facet, G)) {
          for (const [k, g] of maybeGroup(I, K)) {
            for (const [x1, x2, fx] of BX) {
              const bb = fx(g);
              for (const [y1, y2, fy] of BY) {
                const extent = {x1, x2, y1, y2};
                const b = fy(bb);
                if (filter && !filter.reduce(b, extent)) continue;
                groupFacet.push(i++);
                groupData.push(reduceData.reduce(b, data, extent));
                if (K) GK!.push(k);
                if (Z) GZ!.push(G === Z ? f : Z[b[0]]);
                if (F) GF!.push(G === F ? f : F[b[0]]);
                if (S) GS!.push(G === S ? f : S[b[0]]);
                if (BX1) BX1.push(x1), (BX2 as Value[]).push(x2);
                if (BY1) BY1.push(y1), (BY2 as Value[]).push(y2);
                for (const o of outputs) o.reduce(b, extent);
                if (sort) sort.reduce(b);
              }
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      maybeSort(groupFacets, sort, reverse);
      return {data: groupData, facets: groupFacets};
    }),
    ...(!hasOutput(outputs, "x") && (BX1 ? {x1: BX1, x2: BX2, x: mid(BX1, BX2 as GetColumn)} : {x, x1, x2})),
    ...(!hasOutput(outputs, "y") && (BY1 ? {y1: BY1, y2: BY2, y: mid(BY1, BY2 as GetColumn)} : {y, y1, y2})),
    ...(GK && {[gk as string]: GK}),
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

// Allow bin options to be specified as part of outputs; merge them into options.
function mergeOptions<T extends Datum>(
  {cumulative, domain, thresholds, interval, ...outputs}: OutputOptions<T>,
  options: MarkOptions<T>
): [OutputOptions<T>, MarkOptions<T>] {
  return [outputs, {cumulative, domain, thresholds, interval, ...options}];
}

function maybeBinValue<T extends Datum>(
  value0: BinValue<T> | Accessor<T> | number | undefined,
  {cumulative, domain, thresholds, interval}: MarkOptions<T>,
  defaultValue?: Accessor<T>
) {
  const value = (maybeValue(value0) || {}) as BinValue<T>;
  if (value.domain === undefined) value.domain = domain;
  if (value.cumulative === undefined) value.cumulative = cumulative;
  if (value.thresholds === undefined) value.thresholds = thresholds;
  if (value.interval === undefined) value.interval = interval;
  if (value.value === undefined) value.value = defaultValue;
  value.thresholds = maybeThresholds(value.thresholds, value.interval);

  return value;
}

function maybeBinValueTuple<T extends Datum>(options: MarkOptions<T>) {
  const {x, y} = options;
  const x1 = maybeBinValue(x, options);
  const y1 = maybeBinValue(y, options);
  [x1.value, y1.value] = maybeTuple(x1.value, y1.value);
  return {x: x1, y: y1};
}

type Bin = [{x0: number; x1: number}, Set<index>];
type BinFilter = [number | undefined, number | undefined, (I: Series) => Series];

/* : ((data: DataArray) => BinFilter[]) | undefined */
function maybeBin<T extends Datum>(options: BinValue<T> | null) {
  if (options == null) return;
  const {value, cumulative, domain = extent, thresholds} = options;
  const bin = (data: DataArray<T>) => {
    let V = valueof(data, value, Array)! as Value[]; // d3.bin prefers Array input
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bin = binner().value((i: index) => V[i]); // TODO: @d3 types are wrong on this
    if (isTemporal(V) || isTimeThresholds(thresholds)) {
      V = V.map(coerceDate);
      let [min, max] = typeof domain === "function" ? domain(V as Date[]) : domain;
      let t = typeof thresholds === "function" && !isInterval(thresholds) ? thresholds(V, min, max) : thresholds;
      if (typeof t === "number") t = utcTickInterval(min as unknown as Date, max as unknown as Date, t);
      if (isInterval(t)) {
        if (domain === extent) {
          min = t.floor(min);
          max = t.ceil(new Date(+(max as number) + 1));
        }
        t = t.range(min, max);
      }
      bin.thresholds(t).domain([min as number, max as number]);
    } else {
      V = V.map(coerceNumber);
      let d = domain;
      let t = thresholds;
      if (isInterval(t)) {
        let [min, max] = typeof d === "function" ? d(V as number[]) : d!;
        if (d === extent) {
          min = t.floor(min);
          max = t.offset(t.floor(max));
          d = [min as number, max as number];
        }
        t = t.range(min, max);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bin.thresholds(t).domain(d);
    }
    let bins = bin(range(data)).map(binset);
    if (cumulative) bins = ((cumulative as number) < 0 ? bins.reverse() : bins).map(bincumset);
    return bins.map(binfilter);
  };
  bin.label = labelof(value);
  return bin;
}

function maybeThresholds(thresholds: any, interval: any) {
  if (thresholds === undefined) {
    return interval === undefined ? thresholdAuto : maybeRangeInterval(interval);
  }
  if (typeof thresholds === "string") {
    switch (thresholds.toLowerCase()) {
      case "freedman-diaconis":
        return thresholdFreedmanDiaconis;
      case "scott":
        return thresholdScott;
      case "sturges":
        return thresholdSturges;
      case "auto":
        return thresholdAuto;
    }
    throw new Error(`invalid thresholds: ${thresholds}`);
  }
  return thresholds; // pass array, count, or function to bin.thresholds
}

// Unlike the interval transform, we require a range method, too.
function maybeRangeInterval(interval: any) {
  interval = maybeInterval(interval);
  if (!isInterval(interval)) throw new Error(`invalid interval: ${interval}`);
  return interval;
}

function thresholdAuto(values: ArrayLike<number>, min: number, max: number) {
  return Math.min(200, thresholdScott(values, min, max));
}

function isTimeThresholds(t: any) {
  return isTimeInterval(t) || (isIterable(t) && isTemporal(t));
}

function isTimeInterval(t: any) {
  return isInterval(t) && typeof t === "function" && t() instanceof Date;
}

function isInterval(t: any) {
  return t ? typeof t.range === "function" : false;
}

function binset(bin: any): Bin {
  return [bin, new Set(bin)];
}

function bincumset([bin]: Bin, j: number, bins: Bin[]): Bin {
  return [
    bin,
    {
      get size() {
        for (let k = 0; k <= j; ++k) {
          if (bins[k][1].size) {
            return 1; // a non-empty value
          }
        }
        return 0;
      },
      has(i: index) {
        for (let k = 0; k <= j; ++k) {
          if (bins[k][1].has(i)) {
            return true;
          }
        }
        return false;
      }
    } as Set<index>
  ];
}

function binfilter([{x0, x1}, set]: Bin): BinFilter {
  return [x0, x1, set.size ? (I: Series) => I.filter(set.has, set) : binempty];
}

function binempty() {
  return new Uint32Array(0);
}
