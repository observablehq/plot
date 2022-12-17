import {geoCentroid as GeoCentroid, geoPath} from "d3";
import {valueof} from "../options.js";

function centroidof(Centroid, options) {
  let C;
  return {
    ...options,
    x: {transform: (data) => Float64Array.from((C = valueof(data, Centroid)), ([x]) => x)},
    y: {transform: () => Float64Array.from(C, ([, y]) => y)}
  };
}

export function centroid(options) {
  const path = geoPath();
  return centroidof((object) => path.centroid(object), options);
}

export function geoCentroid(options) {
  return centroidof(GeoCentroid, options);
}
