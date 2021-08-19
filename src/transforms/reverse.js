import {basic} from "./basic.js";

export function reverse(options) {
  return basic(options, reverseTransform);
}

export function reverseTransform(data, facets) {
  return {data, facets: facets.map(I => I.slice().reverse())};
}
