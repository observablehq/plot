import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../mark.js";
import {basic} from "./basic.js";

export function select(selector, options = {}) {
  if (typeof selector === "function") return selectAny(selector, undefined, options);
  const k = Object.keys(selector);
  if (k.length !== 1) throw new Error("select one channel");
  const channel = k[0];
  selector = selector[channel];
  const x = options[channel];
  if (x == null) throw new Error(`missing channel: ${channel}`);
  if (typeof selector === "function") return selectAny(selector, x, options);
  switch (`${selector}`.toLowerCase()) {
    case "min": return selectAny(min, x, options);
    case "max": return selectAny(max, x, options);
  }
  throw new Error(`unknown selector: ${selector}`);
}

export function selectFirst(options) {
  return selectAny(first, undefined, options);
}

export function selectLast(options) {
  return selectAny(last, undefined, options);
}

export function selectMinX(options) {
  return select({x: "min"}, options);
}

export function selectMinY(options) {
  return selectAny({y: "min"}, options);
}

export function selectMaxX(options) {
  return selectAny({x: "max"}, options);
}

export function selectMaxY(options) {
  return selectAny({y: "max"}, options);
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

function selectAny(selectIndex, v, options) {
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
