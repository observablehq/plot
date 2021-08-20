import {greatest, group, least} from "d3";
import {maybeInput, maybeZ, valueof} from "../mark.js";
import {basic} from "./basic.js";

export function selectFirst(options) {
  return select(selectorFirst, undefined, options);
}

export function selectLast(options) {
  return select(selectorLast, undefined, options);
}

export function selectMinX(options) {
  return select(selectorMin, "x", options);
}

export function selectMinY(options) {
  return select(selectorMin, "y", options);
}

export function selectMaxX(options) {
  return select(selectorMax, "x", options);
}

export function selectMaxY(options) {
  return select(selectorMax, "y", options);
}

export function select(selector, k, options = {}) {
  const v = k == null ? null : maybeInput(k, options);
  if (k != null && v == null) throw new Error(`missing channel: ${k}`);
  selector = maybeSelector(selector);
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

function maybeSelector(selector) {
  if (selector === undefined) return selectorFirst;
  if (typeof selector === "function") return selector;
  switch ((selector + "").toLowerCase()) {
    case "min": return selectorMin;
    case "max": return selectorMax;
    case "first": return selectorFirst;
    case "last": return selectorLast;
  }
  throw new Error("invalid selector");
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
