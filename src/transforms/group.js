import {group as grouper, sort, sum, deviation, min, max, mean, median, variance} from "d3";
import {firstof} from "../defined.js";
import {valueof, maybeColor, maybeInput, maybeTransform, maybeTuple, maybeLazyChannel, lazyChannel, first, identity, take} from "../mark.js";

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
  {
    data: reduceData = reduceIdentity,
    ...outputs
  } = {}, // channels to aggregate
  {
    domain,
    // normalize, TODO
    ...inputs
  } = {}
) {
  const {z, fill, stroke, ...options} = inputs;

  // Reconstitute the outputs.
  outputs = Object.entries(outputs).map(([name, reduce]) => {
    const reducer = maybeReduce(reduce);
    const value = maybeInput(name, inputs);
    if (value == null && reducer.reduce.length > 1) throw new Error(`missing channel: ${name}`);
    const [output, setOutput] = lazyChannel(value);
    let V, O;
    return {
      name,
      output,
      initialize(data) {
        V = valueof(data, value);
        O = setOutput([]);
      },
      reduce(I) {
        O.push(reducer.reduce(I, V));
      }
    };
  });

  // const m = maybeNormalize(normalize); // TODO
  // const [BL, setBL] = lazyChannel(`${labelof(weight, "Frequency")}${m === 100 ? " (%)" : ""}`);
  const [BX, setBX] = maybeLazyChannel(x);
  const [BY, setBY] = maybeLazyChannel(y);
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
      // const W = valueof(data, weight); // TODO
      const groupFacets = [];
      const groupData = [];
      // const BL = setBL([]);
      const BX = X && setBX([]);
      const BY = Y && setBY([]);
      const BZ = Z && setBZ([]);
      const BF = F && setBF([]);
      const BS = S && setBS([]);
      // let n = W ? sum(W) : data.length; // TODO
      let i = 0;
      for (const output of outputs) {
        output.initialize(data);
      }
      for (const facet of facets) {
        const groupFacet = [];
        // if (normalize === "facet") n = W ? sum(facet, i => W[i]) : facet.length; // TODO
        for (const [, I] of groups(facet, G)) {
          // if (normalize === "z") n = W ? sum(I, i => W[i]) : I.length; // TODO
          for (const [y, fy] of groups(I, Y)) {
            for (const [x, f] of groups(fy, X)) {
              // const l = W ? sum(f, i => W[i]) : f.length; // TODO
              groupFacet.push(i++);
              groupData.push(reduceData.reduce(f, data));
              // BL.push(m ? l * m / n : l);
              if (X) BX.push(x);
              if (Y) BY.push(y);
              if (Z) BZ.push(Z[f[0]]);
              if (F) BF.push(F[f[0]]);
              if (S) BS.push(S[f[0]]);
              for (const output of outputs) {
                output.reduce(f);
              }
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      return {data: groupData, facets: groupFacets};
    })
  };
}

// function maybeNormalize(normalize) {
//   if (!normalize) return;
//   if (normalize === true) return 100;
//   if (typeof normalize === "number") return normalize;
//   switch ((normalize + "").toLowerCase()) {
//     case "facet": case "z": return 100;
//   }
//   throw new Error("invalid normalize");
// }

export function groups(I, X) {
  return X ? sort(grouper(I, i => X[i]), first) : [[, I]];
}

function maybeReduce(reduce) {
  if (reduce && typeof reduce.reduce === "function") return reduce;
  if (typeof reduce === "function") return reduceFunction(reduce);
  switch ((reduce + "").toLowerCase()) {
    case "first": return reduceFirst;
    case "last": return reduceLast;
    case "count": return reduceCount; // TODO normalized proportion
    case "deviation": return reduceAccessor(deviation);
    case "min": return reduceAccessor(min);
    case "max": return reduceAccessor(max);
    case "mean": return reduceAccessor(mean);
    case "median": return reduceAccessor(median);
    case "sum": return reduceAccessor(sum);
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
  reduce(I) {
    return I.length;
  }
};
