import {valueof} from "../mark.js";
import {basic} from "./basic.js";

export function filter(value, options) {
  return basic(options, filterTransform(value));
}

export function filterTransform(value) {
  return (data, facets) => {
    const V = valueof(data, value);
    return {data, facets: facets.map(I => I.filter(i => V[i]))};
  };
}
