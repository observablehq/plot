import {geoCentroid as centroid} from "d3";
import {valueof} from "../options.js";

export function geoCentroid(options) {
  let C;
  return {
    ...options,
    x: {transform: (data) => Float64Array.from((C = valueof(data, centroid)), ([x]) => x)},
    y: {transform: () => Float64Array.from(C, ([, y]) => y)}
  };
}
