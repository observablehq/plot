import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../mark.js";
import {basic} from "./basic.js";

export function selectFirst(options) {
  return select(first, undefined, options);
}

export function selectLast(options) {
  return select(last, undefined, options);
}

export function selectAny(selector, channel = {}, options) {
  let x;
  if (options !== undefined) {
    if (typeof channel !== "string") throw new Error(`unsupported channel definition`);
    x = options[channel];
    if (x == null) throw new Error(`missing channel: ${channel}`);
  } else {
    options = channel;
  }
  if (typeof selector === "function") return select(selector, x, options);
  switch (`${selector}`.toLowerCase()) {
    case "min": return select(min, x, options);
    case "max": return select(max, x, options);
  }
  throw new Error(`unknown selector: ${selector}`);
}

export function selectMinX(options) {
  return selectAny("min", "x", options);
}

export function selectMinY(options) {
  return selectAny("min", "y", options);
}

export function selectMaxX(options) {
  return selectAny("max", "x", options);
}

export function selectMaxY(options) {
  return selectAny("max", "y", options);
}

function* first(I) {
  yield I[0];
}

function* last(I) {
  yield I[I.length - 1];
}

function* min(I, X) {
  yield least(I, i => X[i]);
}

function* max(I, X) {
  yield greatest(I, i => X[i]);
}

function select(selectIndex, v, options) {
  const z = maybeZ(options);
  return basic(options, (data, facets) => {
    const Z = valueof(data, z);
    const V = valueof(data, v);
    const selectFacets = [];
    for (const facet of facets) {
      const selectFacet = [];
      for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selectIndex(I, V)) {
          selectFacet.push(i);
        }
      }
      selectFacets.push(selectFacet);
    }
    return {data, facets: selectFacets};
  });
}
