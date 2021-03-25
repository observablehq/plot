import {group as grouper, sort, sum, InternSet} from "d3";
import {defined} from "../defined.js";
import {valueof, maybeZ, maybeInput, maybeTransform, maybeValue, maybeLazyChannel, lazyChannel, first, identity, take, maybeTuple, labelof} from "../mark.js";

// Group on {z, fill, stroke}.
export function groupZ({x, y, ...options} = {}) {
  return {
    ...x !== undefined && {x},
    ...y !== undefined && {y},
    ...groupn(outputs, options)
  };
}

// Group on {z, fill, stroke}, then on x (optionally).
export function groupX(outputs, {x = identity, y, ...options} = {}) {
  return {
    ...y !== undefined && {y},
    ...groupn(outputs, {x, ...options})
  };
}

// Group on {z, fill, stroke}, then on y (optionally).
export function groupY(outputs, {x, y = identity, ...options} = {}) {
  return {
    ...x !== undefined && {x},
    ...groupn(outputs, {y, ...options})
  };
}

// Group on {z, fill, stroke}, then on x and y (optionally).
export function group(outputs, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return groupn(outputs, {x, y, ...options});
}

function groupn(
  {
    data: reduceData = reduceIdentity,
    ...outputs
  } = {}, // channels to aggregate
  {
    x, // optionally group on x (either a value or {value, domain})
    y, // optionally group on y (either a value or {value, domain})
    domain,
    // normalize, TODO
    // weight, TODO
    ...options
  } = {}
) {

  // Implicit firsts.
  for (const key of ["z", "fill", "stroke"]) {
    if (outputs[key] === undefined && options[key] != null) {
      outputs = {...outputs, [key]: reduceFirst};
    }
  }

  // Reconstitute the outputs.
  outputs = Object.entries(outputs).filter(([, reduce]) => reduce != null).map(([name, reduce]) => {
    // const input = maybeInput(name, options);
    // if (input == null) throw new Error(`missing channel: ${name}`);
    const [output, setOutput] = lazyChannel();
    const r = maybeReduce(reduce);
    let O;
    return {
      name,
      output,
      initialize(data) {
        // O = valueof(data, input);
        O = setOutput([]);
      },
      reduce(I, data) {
        O.push(r.reduce(I, data)); // TODO configurable channel, e.g., min(x)
      }
    };
  });

  // Handle per-dimension domains.
  // TODO This should be derived from the scale’s domain instead.
  let xdomain, ydomain;
  ({value: x, domain: xdomain} = {domain, ...maybeValue(x)});
  ({value: y, domain: ydomain} = {domain, ...maybeValue(y)});

  // Handle both x and y being undefined.
  // TODO Move to group? Needs to handle per-dimension domain with default.
  ([x, y] = maybeTuple(x, y));

  // Determine the z dimension (subgroups within x and y), if any. Note that
  // this requires that the z dimension be defined deterministically.
  const z = maybeZ(options);

  // const m = maybeNormalize(normalize); // TODO
  // const [BL, setBL] = lazyChannel(`${labelof(weight, "Frequency")}${m === 100 ? " (%)" : ""}`);
  const [BX, setBX] = maybeLazyChannel(x);
  const [BY, setBY] = maybeLazyChannel(y);
  // const [BZ, setBZ] = maybeLazyChannel(z);
  // const [vfill] = maybeColor(fill);
  // const [vstroke] = maybeColor(stroke);
  // const [BF = fill, setBF] = maybeLazyChannel(vfill);
  // const [BS = stroke, setBS] = maybeLazyChannel(vstroke);
  const xdefined = BX && maybeDomain(xdomain);
  const ydefined = BY && maybeDomain(ydomain);
  return {
    ...BX && {x: BX},
    ...BY && {y: BY},
    ...options,
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output])),
    transform: maybeTransform(options, (data, facets) => {
      const X = valueof(data, x);
      const Y = valueof(data, y);
      const Z = valueof(data, z);
      // const W = valueof(data, weight); // TODO
      const groupFacets = [];
      const groupData = [];
      // const BL = setBL([]);
      const BX = X && setBX([]);
      const BY = Y && setBY([]);
      // const BZ = Z && setBZ([]);
      // const BF = F && setBF([]);
      // const BS = S && setBS([]);
      // let n = W ? sum(W) : data.length; // TODO
      let i = 0;
      for (const output of outputs) {
        output.initialize(data);
      }
      for (const facet of facets) {
        const groupFacet = [];
        // if (normalize === "facet") n = W ? sum(facet, i => W[i]) : facet.length; // TODO
        for (const [, I] of groups(facet, Z, defined1)) {
          // if (normalize === "z") n = W ? sum(I, i => W[i]) : I.length; // TODO
          for (const [y, fy] of groups(I, Y, ydefined)) {
            for (const [x, f] of groups(fy, X, xdefined)) {
              // const l = W ? sum(f, i => W[i]) : f.length; // TODO
              groupFacet.push(i++);
              groupData.push(reduceData.reduce(f, data));
              // BL.push(m ? l * m / n : l);
              if (X) BX.push(x);
              if (Y) BY.push(y);
              for (const output of outputs) {
                output.reduce(f, data);
              }
              // if (Z) BZ.push(Z[f[0]]);
              // if (F) BF.push(F[f[0]]);
              // if (S) BS.push(S[f[0]]);
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      return {data: groupData, facets: groupFacets};
    })
  };
}

function maybeDomain(domain) {
  if (domain === undefined) return defined1;
  if (domain === null) return () => false;
  domain = new InternSet(domain);
  return ([key]) => domain.has(key);
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

function defined1([key]) {
  return defined(key);
}

export function groups(I, X, defined = defined1) {
  return X ? sort(grouper(I, i => X[i]), first).filter(defined) : [[, I]];
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
