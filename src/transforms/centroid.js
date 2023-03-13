import {geoCentroid as GeoCentroid, geoPath} from "d3";
import {identity, valueof} from "../options.js";
import {initializer} from "./basic.js";

export function centroid({geometry = identity, ...options} = {}) {
  // Suppress defaults for x and y since they will be computed by the initializer.
  return initializer({...options, x: null, y: null}, (data, facets, channels, scales, dimensions, {projection}) => {
    const G = valueof(data, geometry);
    const n = G.length;
    const X = new Float64Array(n);
    const Y = new Float64Array(n);
    const path = geoPath(projection);
    for (let i = 0; i < n; ++i) [X[i], Y[i]] = path.centroid(G[i]);
    return {data, facets, channels: {x: {value: X}, y: {value: Y}}};
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
