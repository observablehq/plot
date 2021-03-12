import {group, min, max, mean, median} from "d3";
import {identity, lazyChannel, maybeColor, maybeLazyChannel, maybeTransform, take, valueof} from "../mark.js";

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
  {data: reduceData = identity, ...outputs} = {}, // channels to reduce
  {[key]: k, z, fill, stroke, ...options} = {} // channels to group, and options
) {
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
  // reducer on the associated input values for each group. (This would probably
  // be more efficient as parallel arrays rather than objects but the number of
  // channels is typically small so it shouldn’t matter.)
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
    ...options,
    ...Object.fromEntries(channels.map(({key, output}) => [key, output])),
    transform: maybeTransform(options, (data, index) => {
      const outIndex = [];
      const outData = [];
      const X = channels.map(({input}) => valueof(data, input));
      const RX = channels.map(({setOutput}) => setOutput([]));
      const K = valueof(data, k);
      const Z = valueof(data, z);
      const F = valueof(data, zfill);
      const S = valueof(data, zstroke);
      const G = K || Z || F || S;
      const RK = K && setRK([]);
      const RZ = Z && setRZ([]);
      const RF = F && setRF([]);
      const RS = S && setRS([]);
      let i = 0;
      for (const facet of index) {
        const outFacet = [];
        for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
          outFacet.push(i++);
          outData.push(reduceData(I, data));
          channels.forEach(({reduce}, i) => RX[i].push(reduce(I, X[i])));
          if (K) RK.push(K[I[0]]);
          if (Z) RZ.push(Z[I[0]]);
          if (F) RF.push(F[I[0]]);
          if (S) RS.push(S[I[0]]);
        }
        outIndex.push(outFacet);
      }
      return {data: outData, index: outIndex};
    })
  };
}

function maybeInput(key, options) {
  if (options[key] !== undefined) return options[key];
  switch (key) {
    case "x1": case "x2": key = "x"; break;
    case "y1": case "y2": key = "y"; break;
  }
  return options[key];
}

function maybeReduce(reduce) {
  if (typeof reduce === "function") return (I, X) => reduce(take(X, I));
  switch ((reduce + "").toLowerCase()) {
    case "min": return reduceMin;
    case "max": return reduceMax;
    case "mean": return reduceMean;
    case "median": return reduceMedian;
  }
  throw new Error("invalid reduce");
}

function reduceMin(I, X) {
  return min(I, i => X[i]);
}

function reduceMax(I, X) {
  return max(I, i => X[i]);
}

function reduceMedian(I, X) {
  return median(I, i => X[i]);
}

function reduceMean(I, X) {
  return mean(I, i => X[i]);
}
