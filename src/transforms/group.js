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
  percentile,
  isTemporal,
  isObject
} from "../options.js";
import {basic} from "./basic.js";

// Group on {z, fill, stroke}.
export function groupZ(outputs, options) {
  return groupn(null, null, outputs, options);
}

// Group on {z, fill, stroke}, then on x.
export function groupX(outputs = {y: "count"}, options = {}) {
  const {x = identity} = options;
  if (x == null) throw new Error("missing channel: x");
  return groupn(x, null, outputs, options);
}

// Group on {z, fill, stroke}, then on y.
export function groupY(outputs = {x: "count"}, options = {}) {
  const {y = identity} = options;
  if (y == null) throw new Error("missing channel: y");
  return groupn(null, y, outputs, options);
}

// Group on {z, fill, stroke}, then on x and y.
export function group(outputs = {fill: "count"}, options = {}) {
  let {x, y} = options;
  [x, y] = maybeTuple(x, y);
  if (x == null) throw new Error("missing channel: x");
  if (y == null) throw new Error("missing channel: y");
  return groupn(x, y, outputs, options);
}

function groupn(
  x, // optionally group on x
  y, // optionally group on y
  {
    data: reduceData = reduceIdentity,
    filter,
    sort,
    reverse,
    ...outputs // output channel definitions
  } = {},
  inputs = {} // input channels and options
) {
  // Compute the outputs.
  outputs = maybeOutputs(outputs, inputs);
  reduceData = maybeReduce(reduceData, identity);
  sort = sort == null ? undefined : maybeOutput("sort", sort, inputs);
  filter = filter == null ? undefined : maybeEvaluator("filter", filter, inputs);

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
      const GX = X && setGX([]);
      const GY = Y && setGY([]);
      const GZ = Z && setGZ([]);
      const GF = F && setGF([]);
      const GS = S && setGS([]);
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
              groupData.push(reduceData.reduceIndex(g, data));
              if (X) GX.push(x);
              if (Y) GY.push(y);
              if (Z) GZ.push(G === Z ? f : Z[g[0]]);
              if (F) GF.push(G === F ? f : F[g[0]]);
              if (S) GS.push(G === S ? f : S[g[0]]);
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

export function hasOutput(outputs, ...names) {
  for (const {name} of outputs) {
    if (names.includes(name)) {
      return true;
    }
  }
  return false;
}

export function maybeOutputs(outputs, inputs, asOutput = maybeOutput) {
  const entries = Object.entries(outputs);
  // Propagate standard mark channels by default.
  if (inputs.title != null && outputs.title === undefined) entries.push(["title", reduceTitle]);
  if (inputs.href != null && outputs.href === undefined) entries.push(["href", reduceFirst]);
  return entries
    .filter(([, reduce]) => reduce !== undefined)
    .map(([name, reduce]) => (reduce === null ? nullOutput(name) : asOutput(name, reduce, inputs)));
}

export function maybeOutput(name, reduce, inputs, asEvaluator = maybeEvaluator) {
  let scale; // optional per-channel scale override
  if (isObject(reduce) && "reduce" in reduce) (scale = reduce.scale), (reduce = reduce.reduce); // N.B. array.reduce
  const evaluator = asEvaluator(name, reduce, inputs);
  const [output, setOutput] = column(evaluator.label);
  let O;
  return {
    name,
    output: scale === undefined ? output : {value: output, scale},
    initialize(data) {
      evaluator.initialize(data);
      O = setOutput([]);
    },
    scope(scope, I) {
      evaluator.scope(scope, I);
    },
    reduce(I, extent) {
      O.push(evaluator.reduce(I, extent));
    }
  };
}

function nullOutput(name) {
  return {name, initialize() {}, scope() {}, reduce() {}};
}

export function maybeEvaluator(name, reduce, inputs, asReduce = maybeReduce) {
  const input = maybeInput(name, inputs);
  const reducer = asReduce(reduce, input);
  let V, context;
  return {
    label: labelof(reducer === reduceCount ? null : input, reducer.label),
    initialize(data) {
      V = input === undefined ? data : valueof(data, input);
      if (reducer.scope === "data") {
        context = reducer.reduceIndex(range(data), V);
      }
    },
    scope(scope, I) {
      if (reducer.scope === scope) {
        context = reducer.reduceIndex(I, V);
      }
    },
    reduce(I, extent) {
      return reducer.scope == null ? reducer.reduceIndex(I, V, extent) : reducer.reduceIndex(I, V, context, extent);
    }
  };
}

export function maybeGroup(I, X) {
  return X
    ? sort(
        grouper(I, (i) => X[i]),
        first
      )
    : [[, I]];
}

export function maybeReduce(reduce, value, fallback = invalidReduce) {
  if (reduce == null) return fallback(reduce);
  if (typeof reduce.reduceIndex === "function") return reduce;
  if (typeof reduce.reduce === "function" && isObject(reduce)) return reduceReduce(reduce); // N.B. array.reduce
  if (typeof reduce === "function") return reduceFunction(reduce);
  if (/^p\d{2}$/i.test(reduce)) return reduceAccessor(percentile(reduce));
  switch (`${reduce}`.toLowerCase()) {
    case "first":
      return reduceFirst;
    case "last":
      return reduceLast;
    case "identity":
      return reduceIdentity;
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
      return reduceMaybeTemporalAccessor(mean);
    case "median":
      return reduceMaybeTemporalAccessor(median);
    case "variance":
      return reduceAccessor(variance);
    case "mode":
      return reduceAccessor(mode);
  }
  return fallback(reduce);
}

function invalidReduce(reduce) {
  throw new Error(`invalid reduce: ${reduce}`);
}

export function maybeSubgroup(outputs, inputs) {
  for (const name in inputs) {
    const value = inputs[name];
    if (value !== undefined && !outputs.some((o) => o.name === name)) {
      return value;
    }
  }
}

export function maybeSort(facets, sort, reverse) {
  if (sort) {
    const S = sort.output.transform();
    const compare = (i, j) => ascendingDefined(S[i], S[j]);
    facets.forEach((f) => f.sort(compare));
  }
  if (reverse) {
    facets.forEach((f) => f.reverse());
  }
}

function reduceReduce(reduce) {
  console.warn("deprecated reduce interface; implement reduceIndex instead.");
  return {...reduce, reduceIndex: reduce.reduce.bind(reduce)};
}

function reduceFunction(f) {
  return {
    reduceIndex(I, X, extent) {
      return f(take(X, I), extent);
    }
  };
}

function reduceAccessor(f) {
  return {
    reduceIndex(I, X) {
      return f(I, (i) => X[i]);
    }
  };
}

function reduceMaybeTemporalAccessor(f) {
  return {
    reduceIndex(I, X) {
      const x = f(I, (i) => X[i]);
      return isTemporal(X) ? new Date(x) : x;
    }
  };
}

export const reduceIdentity = {
  reduceIndex(I, X) {
    return take(X, I);
  }
};

export const reduceFirst = {
  reduceIndex(I, X) {
    return X[I[0]];
  }
};

const reduceTitle = {
  reduceIndex(I, X) {
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
      top[n - 1] = [`… ${bottom.length.toLocaleString("en-US")} more`, sum(bottom, second)];
    }
    return top.map(([key, value]) => `${key} (${value.toLocaleString("en-US")})`).join("\n");
  }
};

const reduceLast = {
  reduceIndex(I, X) {
    return X[I[I.length - 1]];
  }
};

export const reduceCount = {
  label: "Frequency",
  reduceIndex(I) {
    return I.length;
  }
};

const reduceDistinct = {
  label: "Distinct",
  reduceIndex(I, X) {
    const s = new InternSet();
    for (const i of I) s.add(X[i]);
    return s.size;
  }
};

const reduceSum = reduceAccessor(sum);

function reduceProportion(value, scope) {
  return value == null
    ? {scope, label: "Frequency", reduceIndex: (I, V, basis = 1) => I.length / basis}
    : {scope, reduceIndex: (I, V, basis = 1) => sum(I, (i) => V[i]) / basis};
}
