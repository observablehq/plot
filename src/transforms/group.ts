import type {AggregationMethod, Aggregate, BinExtent, MarkOptions, OutputOptions, Reducer} from "../api.js";
import type {DataArray, Datum, index, Series, Value, ValueArray} from "../data.js";
import type {pXX, ValueAccessor} from "../options.js";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

// TODO: check types of the d3.quantile function
type ArrayReducer = (I: Series, value: (i: index) => Value) => Value;

import {
  group as grouper,
  sort,
  sum,
  deviation,
  min,
  max,
  mean,
  median,
  mode,
  variance,
  InternSet,
  minIndex,
  maxIndex,
  rollup
} from "d3";
import {ascendingDefined} from "../defined.js";
import {
  valueof,
  maybeColorChannel,
  maybeInput,
  maybeTuple,
  maybeColumn,
  column,
  first,
  identity,
  take,
  labelof,
  range,
  second,
  percentile
} from "../options.js";
import {basic} from "./basic.js";

// Group on {z, fill, stroke}.
export function groupZ<T extends Datum>(outputs: OutputOptions<T>, options: MarkOptions<T>): MarkOptions<T> {
  return groupn(null, null, outputs, options);
}

// Group on {z, fill, stroke}, then on x.
export function groupX<T extends Datum>(
  outputs: OutputOptions<T> = {y: "count"},
  options: MarkOptions<T> = {}
): MarkOptions<T> {
  const {x = identity} = options;
  if (x == null) throw new Error("missing channel: x");
  return groupn(x, null, outputs, options);
}

// Group on {z, fill, stroke}, then on y.
export function groupY<T extends Datum>(
  outputs: OutputOptions<T> = {x: "count"},
  options: MarkOptions<T> = {}
): MarkOptions<T> {
  const {y = identity} = options;
  if (y == null) throw new Error("missing channel: y");
  return groupn(null, y, outputs, options);
}

// Group on {z, fill, stroke}, then on x and y.
export function group<T extends Datum>(
  outputs: OutputOptions<T> = {fill: "count"},
  options: MarkOptions<T> = {}
): MarkOptions<T> {
  let {x, y} = options;
  [x, y] = maybeTuple(x, y);
  if (x == null) throw new Error("missing channel: x");
  if (y == null) throw new Error("missing channel: y");
  return groupn(x, y, outputs, options);
}

function groupn<T extends Datum>(
  x: number | ValueAccessor<T> | null | undefined, // optionally group on x
  y: number | ValueAccessor<T> | null | undefined, // optionally group on y
  {
    data: reduceData = reduceIdentity, // TODO: not tested and not documented (https://github.com/observablehq/plot/pull/272)
    filter: filter0,
    sort: sort0,
    reverse,
    ...outputs0 // output channel definitions
  }: OutputOptions<T> = {},
  inputs: MarkOptions<T> = {} // input channels and options
) {
  // Compute the outputs.
  const outputs = maybeOutputs(outputs0, inputs);
  reduceData = maybeReduce(reduceData, identity);
  const sort = sort0 == null ? undefined : maybeOutput("sort", sort0, inputs);
  const filter = filter0 == null ? undefined : maybeEvaluator("filter", filter0, inputs);

  // Produce x and y output channels as appropriate.
  const [GX, setGX] = maybeColumn(x);
  const [GY, setGY] = maybeColumn(y);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once.
  const {
    z,
    fill,
    stroke,
    x1,
    x2, // consumed if x is an output
    y1,
    y2, // consumed if y is an output
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
      const X = valueof(data, x);
      const Y = valueof(data, y);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S});
      const groupFacets = [];
      const groupData = [];
      const GX = X && (setGX!([]) as Value[]); // For .push; TODO: type setColumn?
      const GY = Y && (setGY!([]) as Value[]);
      const GZ = Z && (setGZ!([]) as Value[]);
      const GF = F && (setGF!([]) as Value[]);
      const GS = S && (setGS!([]) as Value[]);
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
          for (const [y, gg] of maybeGroup(I, Y)) {
            for (const [x, g] of maybeGroup(gg, X)) {
              if (filter && !filter.reduce(g)) continue;
              groupFacet.push(i++);
              groupData.push(reduceData.reduce(g, data));
              if (X) GX!.push(x);
              if (Y) GY!.push(y);
              if (Z) GZ!.push(G === Z ? f : Z[g[0]]);
              if (F) GF!.push(G === F ? f : F[g[0]]);
              if (S) GS!.push(G === S ? f : S[g[0]]);
              for (const o of outputs) o.reduce(g);
              if (sort) sort.reduce(g);
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      maybeSort(groupFacets, sort, reverse);
      return {data: groupData, facets: groupFacets};
    }),
    ...(!hasOutput(outputs, "x") && (GX ? {x: GX} : {x1, x2})),
    ...(!hasOutput(outputs, "y") && (GY ? {y: GY} : {y1, y2})),
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

export function hasOutput<T extends Datum>(outputs: Reducer<T>[], ...names: Array<Reducer<T>["name"]>) {
  for (const {name} of outputs) {
    if (names.includes(name)) {
      return true;
    }
  }
  return false;
}

export function maybeOutputs<T extends Datum>(outputs: OutputOptions<T>, inputs: MarkOptions<T>) {
  const entries = Object.entries(outputs);
  // Propagate standard mark channels by default.
  if (inputs.title != null && outputs.title === undefined) entries.push(["title", reduceTitle]);
  if (inputs.href != null && outputs.href === undefined) entries.push(["href", reduceFirst]);
  return entries.map(([name, reduce]) => {
    return reduce == null ? {name, initialize() {}, scope() {}, reduce() {}} : maybeOutput(name, reduce, inputs);
  }) as Reducer<T>[];
}

export function maybeOutput<T extends Datum>(name: string, reduce: AggregationMethod, inputs: MarkOptions<T>) {
  const evaluator = maybeEvaluator(name, reduce, inputs);
  const [output, setOutput] = column(evaluator.label);
  let O;
  return {
    name,
    output,
    initialize(data) {
      evaluator.initialize(data);
      O = setOutput([]);
    },
    scope(scope, I: Series) {
      evaluator.scope(scope, I);
    },
    reduce(I: Series, extent: BinExtent) {
      O.push(evaluator.reduce(I, extent));
    }
  } as Reducer<T>;
}

export function maybeEvaluator<T extends Datum>(name: string, reduce: AggregationMethod, inputs: MarkOptions<T>) {
  const input = maybeInput(name, inputs);
  const reducer = maybeReduce(reduce, input);
  let V: ValueArray, context: Value | null | undefined;
  return {
    label: labelof(reducer === reduceCount ? null : input, reducer.label),
    initialize(data: DataArray<T>) {
      V = (input === undefined ? data : valueof(data, input)) as ValueArray;
      if (reducer.scope === "data") {
        context = reducer.reduce(range(data), V);
      }
    },
    scope(scope: Aggregate["scope"], I: Series) {
      if (reducer.scope === scope) {
        context = reducer.reduce(I, V);
      }
    },
    reduce(I: Series, extent?: BinExtent) {
      return reducer.scope == null ? reducer.reduce(I, V, extent) : reducer.reduce(I, V, context, extent);
    }
  };
}

export function maybeGroup(I: Series, X: ValueArray | null | undefined): [Value, Series][] {
  return X
    ? sort(
        grouper(I, (i) => X[i]),
        first
      )
    : [[, I]];
}

export function maybeReduce<T extends Datum>(reduce: AggregationMethod, value: ValueAccessor<T>): Aggregate {
  if (reduce && typeof reduce.reduce === "function") return reduce as Aggregate;
  if (typeof reduce === "function") return reduceFunction(reduce);
  if (/^p\d{2}$/i.test(reduce as string)) return reduceAccessor(percentile(reduce as pXX) as ArrayReducer);
  switch (`${reduce}`.toLowerCase()) {
    case "first":
      return reduceFirst;
    case "last":
      return reduceLast;
    case "count":
      return reduceCount;
    case "distinct":
      return reduceDistinct;
    case "sum":
      return value == null ? reduceCount : reduceSum;
    case "proportion":
      return reduceProportion(value, "data");
    case "proportion-facet":
      return reduceProportion(value, "facet");
    case "deviation":
      return reduceAccessor(deviation);
    case "min":
      return reduceAccessor(min);
    case "min-index":
      return reduceAccessor(minIndex);
    case "max":
      return reduceAccessor(max);
    case "max-index":
      return reduceAccessor(maxIndex);
    case "mean":
      return reduceAccessor(mean);
    case "median":
      return reduceAccessor(median);
    case "variance":
      return reduceAccessor(variance);
    case "mode":
      return reduceAccessor(mode); // TODO: mode can return a string
    case "x":
      return reduceX;
    case "x1":
      return reduceX1;
    case "x2":
      return reduceX2;
    case "y":
      return reduceY;
    case "y1":
      return reduceY1;
    case "y2":
      return reduceY2;
  }
  throw new Error(`invalid reduce: ${reduce}`);
}

export function maybeSubgroup<T extends Datum>(
  outputs: Reducer<T>[],
  inputs: {
    z?: ValueArray | null;
    fill?: ValueArray | null;
    stroke?: ValueArray | null;
  }
) {
  for (const name in inputs) {
    const value = inputs[name as "z" | "fill" | "stroke"];
    if (value !== undefined && !outputs.some((o) => o.name === name)) {
      return value;
    }
  }
}

export function maybeSort<T extends Datum>(
  facets: Series[],
  sort: Reducer<T> | undefined,
  reverse: boolean | undefined
) {
  if (sort) {
    const S = sort.output.transform();
    const compare = (i: index, j: index) => ascendingDefined(S[i], S[j]);
    facets.forEach((f) => f.sort(compare));
  }
  if (reverse) {
    facets.forEach((f) => f.reverse());
  }
}

function reduceFunction(f: (X: ValueArray, extent?: BinExtent) => Value): Aggregate {
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    reduce(I: Series, X: ValueArray, extent?: BinExtent) {
      return f(take(X, I), extent);
    }
  };
}

function reduceAccessor(f: ArrayReducer): Aggregate {
  return {
    reduce(I: Series, X: ValueArray) {
      return f(I, (i: index) => X[i]);
    }
  };
}

export const reduceIdentity = {
  reduce(I: Series, X: ValueArray) {
    return take(X, I);
  }
};

export const reduceFirst = {
  reduce(I: Series, X: ValueArray) {
    return X[I[0]];
  }
};

const reduceTitle = {
  reduce(I: Series, X: ValueArray) {
    const n = 5;
    const groups = sort(
      rollup(
        I,
        (V) => V.length,
        (i) => X[i]
      ),
      second
    );
    const top = groups.slice(-n).reverse();
    if (top.length < groups.length) {
      const bottom = groups.slice(0, 1 - n);
      top[n - 1] = [
        `… ${bottom.length.toLocaleString("en-US")} more`,
        sum(bottom, second as (d: [Value, number]) => number)
      ];
    }
    return top.map(([key, value]) => `${key} (${value.toLocaleString("en-US")})`).join("\n");
  }
};

const reduceLast: Aggregate = {
  reduce(I: Series, X: ValueArray) {
    return X[I[I.length - 1]];
  }
};

export const reduceCount: Aggregate = {
  label: "Frequency",
  reduce(I: Series) {
    return I.length;
  }
};

const reduceDistinct: Aggregate = {
  label: "Distinct",
  reduce: (I: Series, X: ValueArray) => {
    const s = new InternSet();
    for (const i of I) s.add(X[i]);
    return s.size;
  }
};

const reduceSum = reduceAccessor(sum);

function reduceProportion<T extends Datum>(value: ValueAccessor<T>, scope: Aggregate["scope"]): Aggregate {
  return value == null
    ? {scope, label: "Frequency", reduce: (I: Series, V: ValueArray, basis = 1) => I.length / (basis as number)}
    : {scope, reduce: (I: Series, V: ValueArray, basis = 1) => sum(I, (i) => V[i] as number) / (basis as number)};
}

function mid(x1: Date | number | undefined, x2: Date | number | undefined) {
  const m = (+(x1 as number) + +(x2 as number)) / 2;
  return x1 instanceof Date ? new Date(m) : m;
}

const reduceX: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {x1, x2}: BinExtent) {
    return mid(x1, x2);
  }
};

const reduceY: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {y1, y2}: BinExtent) {
    return mid(y1, y2);
  }
};

const reduceX1: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {x1}: BinExtent) {
    return x1;
  }
};

const reduceX2: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {x2}: BinExtent) {
    return x2;
  }
};

const reduceY1: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {y1}: BinExtent) {
    return y1;
  }
};

const reduceY2: Aggregate = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  reduce(I: Series, X: ValueArray, {y2}: BinExtent) {
    return y2;
  }
};
