import {group, min, max, median} from "d3-array";
import {lazyChannel, maybeColor, maybeLazyChannel, maybeTransform, take, valueof} from "../mark.js";

// Group on x if present.
export function reduceX(outputs, {x, ...options} = {}) {
  const [transform, X] = reduce1(x, outputs, options);
  return {x: X, ...transform};
}

// Group on y if present.
export function reduceY(outputs, {y, ...options} = {}) {
  const [transform, Y] = reduce1(y, outputs, options);
  return {y: Y, ...transform};
}

// Group on z, fill, or stroke if present.
export function reduce(outputs, options = {}) {
  const {z, fill: f, stroke: s} = options;
  const [out, g] = z !== undefined ? ["z", z] : maybeColor(f)[0] ? ["fill", f] : maybeColor(s)[0] ? ["stroke", s] : [];
  const [transform, G] = reduce1(g, outputs, options);
  return {...G && {[out]: G}, ...transform};
}

function reduce1(z, outputs, options) {
  const channels = Object.entries(outputs).map(([key, reduce]) => {
    const input = maybeInput(key, options);
    if (input == null) throw new Error(`missing channel: ${key}`);
    const [output, setOutput] = lazyChannel(input);
    return {key, input, output, setOutput, reduce: maybeReduce(reduce)};
  });
  const [RZ, setRZ] = maybeLazyChannel(z);
  return [
    {
      ...options,
      transform: maybeTransform(options, (data, index) => {
        const reduceIndex = [];
        const reduceData = [];
        const X = channels.map(({input}) => valueof(data, input));
        const Z = valueof(data, z);
        const RX = channels.map(({setOutput}) => setOutput([]));
        const RZ = Z && setRZ([]);
        let i = 0;
        for (const facet of index) {
          const reduceFacet = [];
          for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
            reduceFacet.push(i++);
            reduceData.push(take(data, I));
            channels.forEach(({reduce}, i) => RX[i].push(reduce(I, X[i])));
            if (Z) RZ.push(Z[I[0]]);
          }
          reduceIndex.push(reduceFacet);
        }
        return {data: reduceData, index: reduceIndex};
      }),
      ...Object.fromEntries(channels.map(({key, output}) => [key, output]))
    },
    RZ
  ];
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
