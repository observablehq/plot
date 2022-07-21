/* eslint-disable @typescript-eslint/no-explicit-any */
import type {MarkOptions, MarkOptionsDefined, ConstantOrFieldOption, ColumnSetter, PXX, FieldOptionsKey, nullish, IndexArray, booleanOption, Reduce1, AggregationMethod, OutputOptions, ColumnGetter} from "../common.js";

type ComputedReducer = {
  name?: FieldOptionsKey,
  output?: ColumnGetter,
  initialize: (data: any) => void,
  scope: (scope?: any, I?: IndexArray) => void,
  reduce: (I: IndexArray, data?: any) => any,
  label?: string
};


import {group as grouper, sort, sum, deviation, min, max, mean, median, mode, variance, InternSet, minIndex, maxIndex, rollup} from "d3";
import {ascendingDefined} from "../defined.js";
import {valueof, maybeColorChannel, maybeInput, maybeTuple, maybeColumn, column, first, identity, take, labelof, range, second, percentile} from "../options.js";
import {basic} from "./basic.js";

// Group on {z, fill, stroke}.
export function groupZ(outputs: OutputOptions, options: MarkOptions) {
  return groupn(null, null, outputs, options);
}

// Group on {z, fill, stroke}, then on x.
export function groupX(outputs: OutputOptions = {y: "count"}, options: MarkOptionsDefined = {}) {
  const {x = identity} = options;
  if (x == null) throw new Error("missing channel: x");
  return groupn(x, null, outputs, options);
}

// Group on {z, fill, stroke}, then on y.
export function groupY(outputs: OutputOptions = {x: "count"}, options: MarkOptionsDefined = {}) {
  const {y = identity} = options;
  if (y == null) throw new Error("missing channel: y");
  return groupn(null, y, outputs, options);
}

// Group on {z, fill, stroke}, then on x and y.
export function group(outputs: OutputOptions = {fill: "count"}, options: MarkOptionsDefined = {}) {
  let {x, y}: {x?: ConstantOrFieldOption, y?: ConstantOrFieldOption} = options;
  ([x, y] = maybeTuple(x, y));
  if (x == null) throw new Error("missing channel: x");
  if (y == null) throw new Error("missing channel: y");
  return groupn(x, y, outputs, options);
}

function groupn(
  x: ConstantOrFieldOption, // optionally group on x
  y: ConstantOrFieldOption, // optionally group on y
  {
    data: reduceData1 = reduceIdentity,
    filter: filter1,
    sort: sort1,
    reverse,
    ...outputs1 // output channel definitions
  }: OutputOptions = {},
  inputs: MarkOptionsDefined = {} // input channels and options
) {

  // Compute the outputs.
  const outputs = maybeOutputs(outputs1, inputs);
  const reduceData = maybeReduce(reduceData1, identity);
  const sort = sort1 == null ? undefined : maybeOutput("sort", sort1, inputs);
  const filter = filter1 == null ? undefined : maybeEvaluator("filter", filter1, inputs);

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
    x1, x2, // consumed if x is an output
    y1, y2, // consumed if y is an output
    ...options
  } = inputs;
  const [GZ, setGZ] = maybeColumn(z);
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  const [GF, setGF] = maybeColumn(vfill);
  const [GS, setGS] = maybeColumn(vstroke);

  return {
    ..."z" in inputs && {z: GZ || z},
    ..."fill" in inputs && {fill: GF || fill},
    ..."stroke" in inputs && {stroke: GS || stroke},
    ...basic(options, (data, facets) => {
      const X = valueof(data, x);
      const Y = valueof(data, y);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S});
      const groupFacets = [];
      const groupData: number[] = [];
      const GX = X && (setGX as ColumnSetter)([]);
      const GY = Y && (setGY as ColumnSetter)([]);
      const GZ = Z && (setGZ as ColumnSetter)([]);
      const GF = F && (setGF as ColumnSetter)([]);
      const GS = S && (setGS as ColumnSetter)([]);
      let i = 0;
      for (const o of outputs) o.initialize(data);
      if (sort) sort.initialize(data);
      if (filter) filter.initialize(data);
      for (const facet of facets as IndexArray[]) {
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
              if (GX) GX.push(x);
              if (GY) GY.push(y);
              if (GZ) GZ.push(G === Z ? f : Z[g[0]]);
              if (GF) GF.push(G === F ? f : F[g[0]]);
              if (GS) GS.push(G === S ? f : S[g[0]]);
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
    ...!hasOutput(outputs, "x") && (GX ? {x: GX} : {x1, x2}),
    ...!hasOutput(outputs, "y") && (GY ? {y: GY} : {y1, y2}),
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

export function hasOutput(outputs: ComputedReducer[], ...names: string[]) {
  for (const {name} of outputs) {
    if (names.includes(name as string)) {
      return true;
    }
  }
  return false;
}

export function maybeOutputs(outputs: OutputOptions, inputs: MarkOptionsDefined): ComputedReducer[] {
  const entries = Object.entries(outputs);
  // Propagate standard mark channels by default.
  if (inputs.title != null && outputs.title === undefined) entries.push(["title", reduceTitle]);
  if (inputs.href != null && outputs.href === undefined) entries.push(["href", reduceFirst]);
  return entries.map(([name, reduce]: [string, AggregationMethod | undefined]) => {
    return reduce == null
      ? {name, initialize() {}, scope() {}, reduce() {}} as ComputedReducer // type name to a FieldOptionsKey
      : maybeOutput(name as FieldOptionsKey, reduce, inputs);
  });
}

export function maybeOutput(name: FieldOptionsKey, reduce: any, inputs: any) {
  const evaluator = maybeEvaluator(name, reduce, inputs);
  const [output, setOutput] = column(evaluator.label);
  let O;
  return {
    name,
    output,
    initialize(data: any) {
      evaluator.initialize(data);
      O = (setOutput as ColumnSetter)([]);
    },
    scope(scope?: "data" | "facet", I?: IndexArray) {
      evaluator.scope(scope, I);
    },
    reduce(I: IndexArray, extent?: string) {
      O.push(evaluator.reduce(I, extent));
    }
  };
}

export function maybeEvaluator(name: string, reduce: any, inputs: any): ComputedReducer {
  const input = maybeInput(name as FieldOptionsKey, inputs);
  const reducer = maybeReduce(reduce, input);
  let V: ArrayLike<any> | nullish, context: any;
  return {
    label: labelof(reducer === reduceCount ? null : input, reducer.label),
    initialize(data: ArrayLike<any>) {
      V = input === undefined ? data : valueof(data, input);
      if (reducer.scope === "data") {
        context = reducer.reduce(range(data), V);
      }
    },
    scope(scope?: "data" | "facet", I?: IndexArray) {
      if (reducer.scope === scope) {
        context = reducer.reduce(I as IndexArray, V);
      }
    },
    reduce(I: IndexArray, extent?: string) {
      return reducer.scope == null
        ? reducer.reduce(I, V, extent)
        : reducer.reduce(I, V, context, extent);
    }
  };
}

export function maybeGroup(I: IndexArray, X: ArrayLike<any> | nullish): [any, IndexArray][] {
  return X ? sort(grouper(I, i => X[i]), first) : [[, I]];
}

export function maybeReduce(reduce: AggregationMethod, value: any): Reduce1 {
  if (reduce && typeof (reduce as Reduce1).reduce === "function") return reduce as Reduce1;
  if (typeof reduce === "function") return reduceFunction(reduce);
  if (/^p\d{2}$/i.test(reduce as string)) return reduceAccessor(percentile(reduce as PXX));
  switch (`${reduce}`.toLowerCase()) {
    case "first": return reduceFirst;
    case "last": return reduceLast;
    case "count": return reduceCount;
    case "distinct": return reduceDistinct;
    case "sum": return value == null ? reduceCount : reduceSum;
    case "proportion": return reduceProportion(value, "data");
    case "proportion-facet": return reduceProportion(value, "facet");
    case "deviation": return reduceAccessor(deviation);
    case "min": return reduceAccessor(min);
    case "min-index": return reduceAccessor(minIndex);
    case "max": return reduceAccessor(max);
    case "max-index": return reduceAccessor(maxIndex);
    case "mean": return reduceAccessor(mean);
    case "median": return reduceAccessor(median);
    case "variance": return reduceAccessor(variance);
    case "mode": return reduceAccessor(mode);
    case "x": return reduceX;
    case "x1": return reduceX1;
    case "x2": return reduceX2;
    case "y": return reduceY;
    case "y1": return reduceY1;
    case "y2": return reduceY2;
  }
  throw new Error(`invalid reduce: ${reduce}`);
}

export function maybeSubgroup(outputs: ComputedReducer[], inputs: {z?: any, stroke?: any, fill?: any}) {
  for (const name in inputs) {
    const value = inputs[name as "z" | "stroke" | "fill"];
    if (value !== undefined && !outputs.some(o => o.name === name)) {
      return value;
    }
  }
}

export function maybeSort(facets: IndexArray[], sort: ComputedReducer & {output: ColumnGetter} | nullish, reverse: booleanOption) {
  if (sort) {
    const S = sort.output.transform();
    const compare = (i: number, j: number) => ascendingDefined(S[i], S[j]);
    facets.forEach(f => f.sort(compare));
  }
  if (reverse) {
    facets.forEach(f => f.reverse());
  }
}

function reduceFunction(f: (X?: ArrayLike<any>, extent?: any) => any) {
  return {
    reduce(I: IndexArray, X: any[], extent?: any) {
      return f(take(X, I), extent);
    }
  };
}

function reduceAccessor(f: (I: IndexArray, a: (i: number) => any) => any) {
  return {
    reduce(I: IndexArray, X: ArrayLike<any>) {
      return f(I, (i: number) => X[i]);
    }
  };
}

export const reduceIdentity = {
  reduce(I: IndexArray, X: any) {
    return take(X, I);
  }
};

export const reduceFirst = {
  reduce(I: IndexArray, X: any) {
    return X[I[0]];
  }
};

const reduceTitle = {
  reduce(I: IndexArray, X: any) {
    const n = 5;
    const groups = sort(rollup(I, V => V.length, i => X[i]), second);
    const top = groups.slice(-n).reverse();
    if (top.length < groups.length) {
      const bottom = groups.slice(0, 1 - n);
      top[n - 1] = [`… ${bottom.length.toLocaleString("en-US")} more`, sum(bottom, second)];
    }
    return top.map(([key, value]) => `${key} (${value.toLocaleString("en-US")})`).join("\n");
  }
};

const reduceLast = {
  reduce(I: IndexArray, X: any) {
    return X[I[I.length - 1]];
  }
};

export const reduceCount = {
  label: "Frequency",
  reduce(I: IndexArray) {
    return I.length;
  }
};

const reduceDistinct = {
  label: "Distinct",
  reduce: (I: IndexArray, X: any) => {
    const s = new InternSet();
    for (const i of I) s.add(X[i]);
    return s.size;
  }
};

const reduceSum = reduceAccessor(sum);

function reduceProportion(value: any, scope: "data" | "facet") {
  return value == null
      ? {scope, label: "Frequency", reduce: (I: IndexArray, V: any, basis = 1) => I.length / basis}
      : {scope, reduce: (I: IndexArray, V: any, basis = 1) => sum(I, i => V[i]) / basis};
}

function mid(x1: number | Date, x2: number | Date): number | Date {
  const m = (+x1 + +x2) / 2;
  return x1 instanceof Date ? new Date(m) : m;
}

const reduceX = {
  reduce(I: IndexArray, X: any, {x1, x2}: any) {
    return mid(x1, x2);
  }
};

const reduceY = {
  reduce(I: IndexArray, X: any, {y1, y2}: any) {
    return mid(y1, y2);
  }
};

const reduceX1 = {
  reduce(I: IndexArray, X: any, {x1}: any) {
    return x1;
  }
};

const reduceX2 = {
  reduce(I: IndexArray, X: any, {x2}: any) {
    return x2;
  }
};

const reduceY1 = {
  reduce(I: IndexArray, X: any, {y1}: any) {
    return y1;
  }
};

const reduceY2 = {
  reduce(I: IndexArray, X: any, {y2}: any) {
    return y2;
  }
};
