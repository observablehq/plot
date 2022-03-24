import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../options.js";
import {basic} from "./basic.js";

export function select(selector, options = {}) {
  // If specified selector is a string or function, it’s a selector without an
  // input channel such as first or last.
  if (typeof selector === "string") {
    switch (selector.toLowerCase()) {
      case "first": return selectFirst(options);
      case "last": return selectLast(options);
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
    case "min": return selectorMin;
    case "max": return selectorMax;
  }
  throw new Error(`unknown selector: ${selector}`);
}

export function selectFirst(options) {
  return selectChannel(null, selectorFirst, options);
}

export function selectLast(options) {
  return selectChannel(null, selectorLast, options);
}

export function selectMinX(options) {
  return selectChannel("x", selectorMin, options);
}

export function selectMinY(options) {
  return selectChannel("y", selectorMin, options);
}

export function selectMaxX(options) {
  return selectChannel("x", selectorMax, options);
}

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
  yield least(I, i => X[i]);
}

function* selectorMax(I, X) {
  yield greatest(I, i => X[i]);
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
      for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selector(I, V)) {
          selectFacet.push(i);
        }
      }
      selectFacets.push(selectFacet);
    }
    return {data, facets: selectFacets};
  });
}
