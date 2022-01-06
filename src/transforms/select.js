import {greatest, group, least} from "d3";
import {maybeZ, valueof} from "../mark.js";
import {basic} from "./basic.js";
import {defined} from "../defined.js";

export function selectFirst({valid: f, ...options} = {}) {
  return select(first, f, options);
}

export function selectLast({valid: f, ...options} = {}) {
  return select(last, f, options);
}

export function selectValid({valid: f, ...options} = {}) {
  return select(all, f, options);
}

export function selectMinX(options = {}) {
  const x = options.x;
  if (x == null) throw new Error("missing channel: x");
  return select(min, x, options);
}

export function selectMinY(options = {}) {
  const y = options.y;
  if (y == null) throw new Error("missing channel: y");
  return select(min, y, options);
}

export function selectMaxX(options = {}) {
  const x = options.x;
  if (x == null) throw new Error("missing channel: x");
  return select(max, x, options);
}

export function selectMaxY(options = {}) {
  const y = options.y;
  if (y == null) throw new Error("missing channel: y");
  return select(max, y, options);
}

function* first(I, V) {
  if (V) {
    for (const i of I) {
      if (defined(V[i])) {
        return yield i;
      }
    }
  }
  yield I[0];
}

function* last(I, V) {
  if (V) {
    for (const i of I.reverse()) {
      if (defined(V[i])) {
        return yield i;
      }
    }
  }
  yield I[I.length-1];
}

function* all(I, V) {
  for (const i of I) {
    if (!V || defined(V[i])) {
      yield i;
    }
  }
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
