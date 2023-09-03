import {geoCentroid as GeoCentroid, geoPath} from "d3";
import {identity, valueof, maybeValue} from "../options.js";
import {initializer} from "./basic.js";
import {inferChannelScale} from "../channel.js";

export function centroid({geometry = identity, ...options} = {}) {
  // Suppress defaults for x and y since they will be computed by the initializer.
  return initializer({...options, x: null, y: null}, (data, facets, channels, scales, dimensions, context) => {
    const {value, scale} = inferChannelScale("geometry", maybeValue(geometry));
    const G = valueof(data, value);
    const n = G.length;
    const X = new Float64Array(n);
    const Y = new Float64Array(n);
    const projection = scale === "projection" ? context.projection : null;
    const path = geoPath(projection);
    for (let i = 0; i < n; ++i) [X[i], Y[i]] = path.centroid(G[i]);
    return {
      data,
      facets,
      channels: {
        x: {value: X, scale: null, source: null},
        y: {value: Y, scale: null, source: null}
      }
    };
  });
}

export function geoCentroid({geometry = identity, ...options} = {}) {
  let C;
  return {
    ...options,
    x: {transform: (data) => Float64Array.from((C = valueof(valueof(data, geometry), GeoCentroid)), ([x]) => x)},
    y: {transform: () => Float64Array.from(C, ([, y]) => y)}
  };
}
