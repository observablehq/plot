import {geoCentroid as GeoCentroid, geoPath} from "d3";
import {identity, valueof, maybeValue} from "../options.js";
import {initializer} from "./basic.js";
import {geometryChannel} from "../projection.js";

export function centroid({geometry = identity, ...options} = {}) {
  // Suppress defaults for x and y since they will be computed by the initializer.
  return initializer({...options, x: null, y: null}, (data, facets, channels, scales, dimensions, {projection}) => {
    const {value, scale} = geometryChannel(maybeValue(geometry));
    const G = valueof(data, value);
    const n = G.length;
    const X = new Float64Array(n);
    const Y = new Float64Array(n);
    const path = geoPath(scale === "projection" ? projection : null);
    for (let i = 0; i < n; ++i) [X[i], Y[i]] = path.centroid(G[i]);
    return {
      data,
      facets,
      channels: {
        x: {value: X, scale: projection == null ? "x" : null, source: null},
        y: {value: Y, scale: projection == null ? "y" : null, source: null}
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
