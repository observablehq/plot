import {geoCentroid as GeoCentroid} from "d3";
import {memoize1} from "../memoize.js";
import {identity, valueof} from "../options.js";
import {initializer} from "./basic.js";

export function centroid({geometry = identity, ...options} = {}) {
  const getG = memoize1((data) => valueof(data, geometry));
  return initializer(
    // Suppress defaults for x and y since they will be computed by the initializer.
    // Propagate the (memoized) geometry channel in case it’s still needed.
    {...options, x: null, y: null, geometry: {transform: getG}},
    (data, facets, channels, scales, dimensions, context) => {
      const G = getG(data);
      const n = G.length;
      const X = new Float64Array(n);
      const Y = new Float64Array(n);
      const {centroid} = context.path();
      for (let i = 0; i < n; ++i) [X[i], Y[i]] = centroid(G[i]);
      return {
        data,
        facets,
        channels: {x: {value: X, scale: null, source: null}, y: {value: Y, scale: null, source: null}}
      };
    }
  );
}

export function geoCentroid({geometry = identity, ...options} = {}) {
  const getG = memoize1((data) => valueof(data, geometry));
  const getC = memoize1((data) => valueof(getG(data), GeoCentroid));
  return {
    ...options,
    x: {transform: (data) => Float64Array.from(getC(data), ([x]) => x)},
    y: {transform: (data) => Float64Array.from(getC(data), ([, y]) => y)},
    geometry: {transform: getG}
  };
}
