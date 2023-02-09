import {randomLcg} from "d3";
import {ascendingDefined, descendingDefined} from "../defined.js";
import {arrayify, isDomainSort, isOptions, maybeValue, valueof} from "../options.js";

/** @jsdoc transform */
export function basic(options = {}, transform) {
  let {filter: f1, sort: s1, reverse: r1, transform: t1, initializer: i1, ...remainingOptions} = options;
  // If both t1 and t2 are defined, returns a composite transform that first
  // applies t1 and then applies t2.
  if (t1 === undefined) {
    // explicit transform overrides filter, sort, and reverse
    if (f1 != null) t1 = filterTransform(f1);
    if (s1 != null && !isDomainSort(s1)) t1 = composeTransform(t1, sortTransform(s1));
    if (r1) t1 = composeTransform(t1, reverseTransform);
  }
  if (transform != null && i1 != null) throw new Error("transforms cannot be applied after initializers");
  return {
    ...remainingOptions,
    ...((s1 === null || isDomainSort(s1)) && {sort: s1}),
    transform: composeTransform(t1, transform)
  };
}

/** @jsdoc initializer */
export function initializer(options = {}, initializer) {
  let {filter: f1, sort: s1, reverse: r1, initializer: i1, ...remainingOptions} = options;
  // If both i1 and i2 are defined, returns a composite initializer that first
  // applies i1 and then applies i2.
  if (i1 === undefined) {
    // explicit initializer overrides filter, sort, and reverse
    if (f1 != null) i1 = filterTransform(f1);
    if (s1 != null && !isDomainSort(s1)) i1 = composeInitializer(i1, sortTransform(s1));
    if (r1) i1 = composeInitializer(i1, reverseTransform);
  }
  return {
    ...remainingOptions,
    ...((s1 === null || isDomainSort(s1)) && {sort: s1}),
    initializer: composeInitializer(i1, initializer)
  };
}

function composeTransform(t1, t2) {
  if (t1 == null) return t2 === null ? undefined : t2;
  if (t2 == null) return t1 === null ? undefined : t1;
  return function (data, facets) {
    ({data, facets} = t1.call(this, data, facets));
    return t2.call(this, arrayify(data), facets);
  };
}

function composeInitializer(i1, i2) {
  if (i1 == null) return i2 === null ? undefined : i2;
  if (i2 == null) return i1 === null ? undefined : i1;
  return function (data, facets, channels, ...args) {
    let c1, d1, f1, c2, d2, f2;
    ({data: d1 = data, facets: f1 = facets, channels: c1} = i1.call(this, data, facets, channels, ...args));
    ({data: d2 = d1, facets: f2 = f1, channels: c2} = i2.call(this, d1, f1, {...channels, ...c1}, ...args));
    return {data: d2, facets: f2, channels: {...c1, ...c2}};
  };
}

function apply(options, t) {
  return (options.initializer != null ? initializer : basic)(options, t);
}

/** @jsdoc filter */
export function filter(test, options) {
  return apply(options, filterTransform(test));
}

function filterTransform(value) {
  return (data, facets) => {
    const V = valueof(data, value);
    return {data, facets: facets.map((I) => I.filter((i) => V[i]))};
  };
}

/** @jsdoc reverse */
export function reverse(options) {
  return {...apply(options, reverseTransform), sort: null};
}

function reverseTransform(data, facets) {
  return {data, facets: facets.map((I) => I.slice().reverse())};
}

/** @jsdoc shuffle */
export function shuffle(options = {}) {
  const {seed, ...remainingOptions} = options;
  return {...apply(remainingOptions, sortValue(seed == null ? Math.random : randomLcg(seed))), sort: null};
}

/** @jsdoc sort */
export function sort(order, options) {
  return {
    ...(isOptions(order) && order.channel !== undefined ? initializer : apply)(options, sortTransform(order)),
    sort: null
  };
}

function sortTransform(value) {
  return (typeof value === "function" && value.length !== 1 ? sortData : sortValue)(value);
}

function sortData(compare) {
  return (data, facets) => {
    const compareData = (i, j) => compare(data[i], data[j]);
    return {data, facets: facets.map((I) => I.slice().sort(compareData))};
  };
}

function sortValue(value) {
  let channel, order;
  ({channel, value, order = ascendingDefined} = {...maybeValue(value)});
  if (typeof order !== "function") {
    switch (`${order}`.toLowerCase()) {
      case "ascending":
        order = ascendingDefined;
        break;
      case "descending":
        order = descendingDefined;
        break;
      default:
        throw new Error(`invalid order: ${order}`);
    }
  }
  return (data, facets, channels) => {
    let V;
    if (channel === undefined) {
      V = valueof(data, value);
    } else {
      if (channels === undefined) throw new Error("channel sort requires an initializer");
      V = channels[channel];
      if (!V) return {}; // ignore missing channel
      V = V.value;
    }
    const compareValue = (i, j) => order(V[i], V[j]);
    return {data, facets: facets.map((I) => I.slice().sort(compareValue))};
  };
}
