import {group as grouper, sort, sum, deviation, min, max, mean, median, variance, curveBasis} from "d3";
import {firstof} from "../defined.js";
import {valueof, maybeColor, maybeInput, maybeTransform, maybeTuple, maybeLazyChannel, lazyChannel, first, identity, take, labelof, range} from "../mark.js";

// Group on {z, fill, stroke}.
export function groupZ(outputs, options) {
  return groupn(null, null, outputs, options);
}

// Group on {z, fill, stroke}, then on x (optionally).
export function groupX(outputs, options = {}) {
  const {x = identity} = options;
  return groupn(x, null, outputs, options);
}

// Group on {z, fill, stroke}, then on y (optionally).
export function groupY(outputs, options = {}) {
  const {y = identity} = options;
  return groupn(null, y, outputs, options);
}

// Group on {z, fill, stroke}, then on x and y (optionally).
export function group(outputs, options = {}) {
  let {x, y} = options;
  ([x, y] = maybeTuple(x, y));
  return groupn(x, y, outputs, options);
}

function groupn(
  x, // optionally group on x
  y, // optionally group on y
  {data: reduceData = reduceIdentity, ...outputs} = {}, // output channel definitions
  inputs = {} // input channels and options
) {

  // Prepare the output channels: detect the corresponding inputs and reducers.
  outputs = Object.entries(outputs).map(([name, reduce]) => {
    const value = maybeInput(name, inputs);
    const reducer = maybeReduce(reduce, value);
    const [output, setOutput] = lazyChannel(labelof(value, reducer.label));
    let V, O, context;
    return {
      name,
      output,
      initialize(data) {
        V = valueof(data, value);
        O = setOutput([]);
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
        O.push(reducer.reduce(I, V, context));
      }
    };
  });

  // The x and y channels are used for grouping. Note that the passed-through
  // options may also include x and y channels which are ignored, so we only
  // want to generate these as output channels if they were used for grouping.
  const [BX, setBX] = maybeLazyChannel(x);
  const [BY, setBY] = maybeLazyChannel(y);

  // The z, fill, and stroke channels (if channels and not constants) are
  // greedily materialized by the transform so that we can reference them for
  // subdividing groups without having to compute them more than once.
  const {z, fill, stroke, ...options} = inputs;
  const [BZ, setBZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [BF = fill, setBF] = maybeLazyChannel(vfill);
  const [BS = stroke, setBS] = maybeLazyChannel(vstroke);

  return {
    z: BZ,
    fill: BF,
    stroke: BS,
    ...options,
    ...BX && {x: BX},
    ...BY && {y: BY},
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output])),
    transform: maybeTransform(options, (data, facets) => {
      const X = valueof(data, x);
      const Y = valueof(data, y);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = firstof(Z, F, S);
      const groupFacets = [];
      const groupData = [];
      const BX = X && setBX([]);
      const BY = Y && setBY([]);
      const BZ = Z && setBZ([]);
      const BF = F && setBF([]);
      const BS = S && setBS([]);
      let i = 0;
      for (const o of outputs) o.initialize(data);
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const [, I] of maybeGroup(facet, G)) {
          for (const o of outputs) o.scope("z", facet);
          for (const [y, gg] of maybeGroup(I, Y)) {
            for (const [x, g] of maybeGroup(gg, X)) {
              groupFacet.push(i++);
              groupData.push(reduceData.reduce(g, data));
              if (X) BX.push(x);
              if (Y) BY.push(y);
              if (Z) BZ.push(Z[g[0]]);
              if (F) BF.push(F[g[0]]);
              if (S) BS.push(S[g[0]]);
              for (const o of outputs) o.reduce(g);
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      return {data: groupData, facets: groupFacets};
    })
  };
}

export function maybeGroup(I, X) {
  return X ? sort(grouper(I, i => X[i]), first) : [[, I]];
}

function maybeReduce(reduce, value) {
  if (reduce && typeof reduce.reduce === "function") return reduce;
  if (typeof reduce === "function") return reduceFunction(reduce);
  switch ((reduce + "").toLowerCase()) {
    case "first": return reduceFirst;
    case "last": return reduceLast;
    case "count": return reduceCount;
    case "sum": return value == null ? reduceCount : reduceSum;
    case "proportion": return reduceProportion(value, "data");
    case "proportion-facet": return reduceProportion(value, "facet");
    case "proportion-z": return reduceProportion(value, "z");
    case "deviation": return reduceAccessor(deviation);
    case "min": return reduceAccessor(min);
    case "max": return reduceAccessor(max);
    case "mean": return reduceAccessor(mean);
    case "median": return reduceAccessor(median);
    case "variance": return reduceAccessor(variance);
  }
  throw new Error("invalid reduce");
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

const reduceIdentity = {
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

const reduceCount = {
  label: "Frequency",
  reduce(I) {
    return I.length;
  }
};

const reduceSum = reduceAccessor(sum);

function reduceProportion(value, scope) {
  return value == null
      ? {scope, label: "Frequency", reduce: (I, V, basis = 1) => I.length / basis}
      : {scope, reduce: (I, V, basis = 1) => sum(I, i => V[i]) / basis};
}
