import {randomLcg} from "d3";
import {ascendingDefined} from "../defined.js";
import {valueof} from "../mark.js";
import {basic} from "./basic.js";

export function shuffle({seed, ...options} = {}) {
  return basic(options, sortValue(seed == null ? Math.random : randomLcg(seed)));
}

export function sort(value, options) {
  return basic(options, sortTransform(value));
}

export function sortTransform(value) {
  return (typeof value === "function" && value.length !== 1 ? sortCompare : sortValue)(value);
}

function sortCompare(compare) {
  return (data, facets) => {
    const compareData = (i, j) => compare(data[i], data[j]);
    return {data, facets: facets.map(I => I.slice().sort(compareData))};
  };
}

function sortValue(value) {
  return (data, facets) => {
    const V = valueof(data, value);
    const compareValue = (i, j) => ascendingDefined(V[i], V[j]);
    return {data, facets: facets.map(I => I.slice().sort(compareValue))};
  };
}
