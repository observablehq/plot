import {randomLcg} from "d3";
import {ascendingDefined} from "../defined.js";
import {arrayify, isOptions, valueof} from "../options.js";

// If both t1 and t2 are defined, returns a composite transform that first
// applies t1 and then applies t2.
export function basic({
  filter: f1,
  sort: s1,
  reverse: r1,
  transform: t1,
  ...options
} = {}, t2) {
  if (t1 === undefined) { // explicit transform overrides filter, sort, and reverse
    if (f1 != null) t1 = filterTransform(f1);
    if (s1 != null && !isOptions(s1)) t1 = composeTransform(t1, sortTransform(s1));
    if (r1) t1 = composeTransform(t1, reverseTransform);
  }
  return {
    ...options,
    ...isOptions(s1) && {sort: s1},
    transform: composeTransform(t1, t2)
  };
}

function composeTransform(t1, t2) {
  if (t1 == null) return t2 === null ? undefined : t2;
  if (t2 == null) return t1 === null ? undefined : t1;
  return (data, facets) => {
    ({data, facets} = t1(data, facets));
    return t2(arrayify(data), facets);
  };
}

export function filter(value, options) {
  return basic(options, filterTransform(value));
}

function filterTransform(value) {
  return (data, facets) => {
    const V = valueof(data, value);
    return {data, facets: facets.map(I => I.filter(i => V[i]))};
  };
}

export function reverse(options) {
  return basic(options, reverseTransform);
}

function reverseTransform(data, facets) {
  return {data, facets: facets.map(I => I.slice().reverse())};
}

export function shuffle({seed, ...options} = {}) {
  return basic(options, sortValue(seed == null ? Math.random : randomLcg(seed)));
}

export function sort(value, options) {
  return basic(options, sortTransform(value));
}

function sortTransform(value) {
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
