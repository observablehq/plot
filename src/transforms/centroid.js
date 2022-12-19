import {geoCentroid as GeoCentroid, geoPath} from "d3";
import {identity, valueof} from "../options.js";

function centroidof(Centroid, {geometry = identity, ...options} = {}) {
  let C;
  return {
    ...options,
    x: {transform: (data) => Float64Array.from((C = valueof(valueof(data, geometry), Centroid)), ([x]) => x)},
    y: {transform: () => Float64Array.from(C, ([, y]) => y)}
  };
}

/** @jsdoc centroid */
export function centroid(options) {
  const path = geoPath();
  return centroidof((object) => path.centroid(object), options);
}

/** @jsdoc geoCentroid */
export function geoCentroid(options) {
  return centroidof(GeoCentroid, options);
}
