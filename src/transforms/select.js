import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../options.js";
import {basic} from "./basic.js";

/**
 * Selects the points of each series selected by the *selector*, which can be
 * specified either as a function which receives as input the index of the
 * series, the shorthand “first” or “last”, or as a {*key*: *value*} object with
 * exactly one *key* being the name of a channel and the *value* being a
 * function which receives as input the index of the series and the channel
 * values. The *value* may alternatively be specified as the shorthand “min” and
 * “max” which respectively select the minimum and maximum points for the
 * specified channel.
 *
 * For example, to select the point within each series that is the closest to
 * the median of the *y* channel:
 *
 * ```js
 * Plot.select({
 *   y: (I, V) => {
 *     const median = d3.median(I, i => V[i]);
 *     const i = d3.least(I, i => Math.abs(V[i] - median));
 *     return [i];
 *   }
 * }, {
 *   x: "year",
 *   y: "revenue",
 *   fill: "format"
 * })
 * ```
 *
 * To pick three points at random in each series:
 *
 * ```js
 * Plot.select(I => d3.shuffle(I.slice()).slice(0, 3), {z: "year", ...})
 * ```
 *
 * To pick the point in each city with the highest temperature:
 *
 * ```js
 * Plot.select({fill: "max"}, {x: "date", y: "city", fill: "temperature", z: "city"})
 * ```
 */
export function select(selector, options = {}) {
  // If specified selector is a string or function, it’s a selector without an
  // input channel such as first or last.
  if (typeof selector === "string") {
    switch (selector.toLowerCase()) {
      case "first":
        return selectFirst(options);
      case "last":
        return selectLast(options);
    }
  }
  if (typeof selector === "function") {
    return selectChannel(null, selector, options);
  }
  // Otherwise the selector is an option {name: value} where name is a channel
  // name and value is a selector definition that additionally takes the given
  // channel values as input. The selector object must have exactly one key.
  let key, value;
  for (key in selector) {
    if (value !== undefined) throw new Error("ambiguous selector; multiple inputs");
    value = maybeSelector(selector[key]);
  }
  if (value === undefined) throw new Error(`invalid selector: ${selector}`);
  return selectChannel(key, value, options);
}

function maybeSelector(selector) {
  if (typeof selector === "function") return selector;
  switch (`${selector}`.toLowerCase()) {
    case "min":
      return selectorMin;
    case "max":
      return selectorMax;
  }
  throw new Error(`unknown selector: ${selector}`);
}

/**
 * Selects the first point of each series according to input order.
 */
export function selectFirst(options) {
  return selectChannel(null, selectorFirst, options);
}

/**
 * Selects the last point of each series according to input order.
 */
export function selectLast(options) {
  return selectChannel(null, selectorLast, options);
}

/**
 * Selects the leftmost point of each series.
 */
export function selectMinX(options) {
  return selectChannel("x", selectorMin, options);
}

/**
 * Selects the lowest point of each series.
 */
export function selectMinY(options) {
  return selectChannel("y", selectorMin, options);
}

/**
 * Selects the rightmost point of each series.
 */
export function selectMaxX(options) {
  return selectChannel("x", selectorMax, options);
}

/**
 * Selects the highest point of each series.
 */
export function selectMaxY(options) {
  return selectChannel("y", selectorMax, options);
}

function* selectorFirst(I) {
  yield I[0];
}

function* selectorLast(I) {
  yield I[I.length - 1];
}

function* selectorMin(I, X) {
  yield least(I, (i) => X[i]);
}

function* selectorMax(I, X) {
  yield greatest(I, (i) => X[i]);
}

function selectChannel(v, selector, options) {
  if (v != null) {
    if (options[v] == null) throw new Error(`missing channel: ${v}`);
    v = options[v];
  }
  const z = maybeZ(options);
  return basic(options, (data, facets) => {
    const Z = valueof(data, z);
    const V = valueof(data, v);
    const selectFacets = [];
    for (const facet of facets) {
      const selectFacet = [];
      for (const I of Z ? group(facet, (i) => Z[i]).values() : [facet]) {
        for (const i of selector(I, V)) {
          selectFacet.push(i);
        }
      }
      selectFacets.push(selectFacet);
    }
    return {data, facets: selectFacets};
  });
}
