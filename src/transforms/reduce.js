import {deviation, group, min, max, mean, median, sum, variance} from "d3";
import {firstof} from "../defined.js";
import {lazyChannel, maybeColor, maybeLazyChannel, maybeInput, maybeTransform, take, valueof} from "../mark.js";

// Group on y, z, fill, or stroke, if any, then reduce.
export function reduceX(outputs, options) {
  return reducen("y", outputs, options);
}

// Group on x, z, fill, or stroke, if any, then reduce.
export function reduceY(outputs, options) {
  return reducen("x", outputs, options);
}

// Group on z, fill, or stroke, if any, then reduce.
export function reduce(outputs, options) {
  return reducen(undefined, outputs, options);
}

function reducen(
  key, // an optional additional group channel (x or y, typically)
  {data: reduceData = reduceIdentity, ...outputs} = {}, // channels to reduce
  options = {} // channels to group, and options
) {
  const {[key]: k, z, fill, stroke, ...rest} = options;
  reduceData = maybeReduce(reduceData);

  // All channels that are candidates for grouping are aggregated by picking the
  // first value from the corresponding input value, even if they are not
  // actually used for grouping.
  const [zfill] = maybeColor(fill);
  const [zstroke] = maybeColor(stroke);
  const [RK, setRK] = maybeLazyChannel(k);
  const [RZ, setRZ] = maybeLazyChannel(z);
  const [RF = fill, setRF] = maybeLazyChannel(zfill);
  const [RS = stroke, setRS] = maybeLazyChannel(zstroke);

  // All output channels are aggregated by applying the corresponding specified
  // reducer on the associated input values for each group.
  const channels = Object.entries(outputs).map(([key, reduce]) => {
    const input = maybeInput(key, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = lazyChannel(input);
    return {key, input, output, setOutput, reduce: maybeReduce(reduce)};
  });

  return {
    ...key && {[key]: RK},
    z: RZ,
    fill: RF,
    stroke: RS,
    ...rest,
    ...Object.fromEntries(channels.map(({key, output}) => [key, output])),
    transform: maybeTransform(options, (data, facets) => {
      const outFacets = [];
      const outData = [];
      const X = channels.map(({input}) => valueof(data, input));
      const RX = channels.map(({setOutput}) => setOutput([]));
      const K = valueof(data, k);
      const Z = valueof(data, z);
      const F = valueof(data, zfill);
      const S = valueof(data, zstroke);
      const G = firstof(K, Z, F, S);
      const RK = K && setRK([]);
      const RZ = Z && setRZ([]);
      const RF = F && setRF([]);
      const RS = S && setRS([]);
      let i = 0;
      for (const facet of facets) {
        const outFacet = [];
        for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
          outFacet.push(i++);
          outData.push(reduceData.reduce(I, data));
          channels.forEach(({reduce}, i) => RX[i].push(reduce.reduce(I, X[i])));
          if (K) RK.push(K[I[0]]);
          if (Z) RZ.push(Z[I[0]]);
          if (F) RF.push(F[I[0]]);
          if (S) RS.push(S[I[0]]);
        }
        outFacets.push(outFacet);
      }
      return {data: outData, facets: outFacets};
    })
  };
}

function maybeReduce(reduce) {
  if (reduce && typeof reduce.reduce === "function") return reduce;
  if (typeof reduce === "function") return reduceFunction(reduce);
  switch ((reduce + "").toLowerCase()) {
    case "deviation": return reduceFunction2(deviation);
    case "min": return reduceFunction2(min);
    case "max": return reduceFunction2(max);
    case "mean": return reduceFunction2(mean);
    case "median": return reduceFunction2(median);
    case "sum": return reduceFunction2(sum);
    case "variance": return reduceFunction2(variance);
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

function reduceFunction2(f) {
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
