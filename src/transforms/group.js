import {group as grouper, sort, sum, deviation, min, max, mean, median, mode, variance, InternSet, minIndex, maxIndex} from "d3";
import {ascendingDefined, firstof} from "../defined.js";
import {valueof, maybeColor, maybeInput, maybeTuple, maybeLazyChannel, lazyChannel, first, identity, take, labelof, range} from "../mark.js";
import {basic} from "./basic.js";

// Group on {z, fill, stroke}.
export function groupZ(outputs, options) {
  return groupn(null, null, outputs, options);
}

// Group on {z, fill, stroke}, then on x.
export function groupX(outputs, options = {}) {
  const {x = identity} = options;
  if (x == null) throw new Error("missing channel: x");
  return groupn(x, null, outputs, options);
}

// Group on {z, fill, stroke}, then on y.
export function groupY(outputs, options = {}) {
  const {y = identity} = options;
  if (y == null) throw new Error("missing channel: y");
  return groupn(null, y, outputs, options);
}

// Group on {z, fill, stroke}, then on x and y.
export function group(outputs, options = {}) {
  let {x, y} = options;
  ([x, y] = maybeTuple(x, y));
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
  const [GX, setGX] = maybeLazyChannel(x);
  const [GY, setGY] = maybeLazyChannel(y);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once.
  const {z, fill, stroke, ...options} = inputs;
  const [GZ, setGZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [GF = fill, setGF] = maybeLazyChannel(vfill);
  const [GS = stroke, setGS] = maybeLazyChannel(vstroke);

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
      const G = maybeSubgroup(outputs, Z, F, S);
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
              groupData.push(reduceData.reduce(g, data));
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
    ...GX && {x: GX},
    ...GY && {y: GY},
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

export function maybeOutputs(outputs, inputs) {
  return Object.entries(outputs).map(([name, reduce]) => maybeOutput(name, reduce, inputs));
}

export function maybeOutput(name, reduce, inputs) {
  const evaluator = maybeEvaluator(name, reduce, inputs);
  const [output, setOutput] = lazyChannel(evaluator.label);
  let O;
  return {
    name,
    output,
    initialize(data) {
      evaluator.initialize(data);
      O = setOutput([]);
    },
    scope(scope, I) {
      evaluator.scope(scope, I);
    },
    reduce(I) {
      O.push(evaluator.reduce(I));
    }
  };
}

export function maybeEvaluator(name, reduce, inputs) {
  const input = maybeInput(name, inputs);
  const reducer = maybeReduce(reduce, input);
  let V, context;
  return {
    label: labelof(input, reducer.label),
    initialize(data) {
      V = input === undefined ? data : valueof(data, input);
      if (reducer.scope === "data") {
        context = reducer.reduce(range(data), V);
      }
    },
    scope(scope, I) {
      if (reducer.scope === scope) {
        context = reducer.reduce(I, V);
      }
    },
    reduce(I) {
      return reducer.reduce(I, V, context);
    }
  };
}

export function maybeGroup(I, X) {
  return X ? sort(grouper(I, i => X[i]), first) : [[, I]];
}

export function maybeReduce(reduce, value) {
  if (reduce && typeof reduce.reduce === "function") return reduce;
  if (typeof reduce === "function") return reduceFunction(reduce);
  switch ((reduce + "").toLowerCase()) {
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
  }
  throw new Error("invalid reduce");
}

export function maybeSubgroup(outputs, Z, F, S) {
  return firstof(
    outputs.some(o => o.name === "z") ? undefined : Z,
    outputs.some(o => o.name === "fill") ? undefined : F,
    outputs.some(o => o.name === "stroke") ? undefined : S
  );
}

export function maybeSort(facets, sort, reverse) {
  if (sort) {
    const S = sort.output.transform();
    const compare = (i, j) => ascendingDefined(S[i], S[j]);
    facets.forEach(f => f.sort(compare));
  }
  if (reverse) {
    facets.forEach(f => f.reverse());
  }
}

function reduceFunction(f) {
  return {
    reduce(I, X) {
      return f(take(X, I));
    }
  };
}

function reduceAccessor(f) {
  return {
    reduce(I, X) {
      return f(I, i => X[i]);
    }
  };
}

export const reduceIdentity = {
  reduce(I, X) {
    return take(X, I);
  }
};

const reduceFirst = {
  reduce(I, X) {
    return X[I[0]];
  }
};

const reduceLast = {
  reduce(I, X) {
    return X[I[I.length - 1]];
  }
};

export const reduceCount = {
  label: "Frequency",
  reduce(I) {
    return I.length;
  }
};

const reduceDistinct = {
  label: "Distinct",
  reduce: (I, X) => {
    const s = new InternSet();
    for (const i of I) s.add(X[i]);
    return s.size;
  }
};

const reduceSum = reduceAccessor(sum);

function reduceProportion(value, scope) {
  return value == null
      ? {scope, label: "Frequency", reduce: (I, V, basis = 1) => I.length / basis}
      : {scope, reduce: (I, V, basis = 1) => sum(I, i => V[i]) / basis};
}
