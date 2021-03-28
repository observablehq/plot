import {group as grouper, sort, sum, deviation, min, max, mean, median, variance} from "d3";
import {firstof} from "../defined.js";
import {valueof, maybeColor, maybeInput, maybeTransform, maybeTuple, maybeLazyChannel, lazyChannel, first, identity, take, labelof, range} from "../mark.js";

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
  {data: reduceData = reduceIdentity, ...outputs} = {}, // output channel definitions
  inputs = {} // input channels and options
) {
  reduceData = maybeReduce(reduceData, identity);
  outputs = maybeOutputs(outputs, inputs);

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
    z: GZ,
    fill: GF,
    stroke: GS,
    ...options,
    ...GX && {x: GX},
    ...GY && {y: GY},
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output])),
    transform: maybeTransform(options, (data, facets) => {
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
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        for (const [, I] of maybeGroup(facet, G)) {
          for (const [y, gg] of maybeGroup(I, Y)) {
            for (const [x, g] of maybeGroup(gg, X)) {
              groupFacet.push(i++);
              groupData.push(reduceData.reduce(g, data));
              if (X) GX.push(x);
              if (Y) GY.push(y);
              if (Z) GZ.push(Z[g[0]]);
              if (F) GF.push(F[g[0]]);
              if (S) GS.push(S[g[0]]);
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

export function maybeOutputs(outputs, inputs) {
  return Object.entries(outputs).map(([name, reduce]) => {
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
    case "sum": return value == null ? reduceCount : reduceSum;
    case "proportion": return reduceProportion(value, "data");
    case "proportion-facet": return reduceProportion(value, "facet");
    case "deviation": return reduceAccessor(deviation);
    case "min": return reduceAccessor(min);
    case "max": return reduceAccessor(max);
    case "mean": return reduceAccessor(mean);
    case "median": return reduceAccessor(median);
    case "variance": return reduceAccessor(variance);
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
