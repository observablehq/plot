import {greatest, group, least} from "d3-array";
import {maybeColor, range, valueof} from "../mark.js";

export function selectFirst(options = {}) {
  return {...options, transform: select(first, undefined, options)};
}

export function selectLast(options = {}) {
  return {...options, transform: select(last, undefined, options)};
}

export function selectMinX(options = {}) {
  return {...options, transform: select(min, "x", options)};
}

export function selectMinY(options = {}) {
  return {...options, transform: select(min, "y", options)};
}

export function selectMaxX(options = {}) {
  return {...options, transform: select(max, "x", options)};
}

export function selectMaxY(options = {}) {
  return {...options, transform: select(max, "y", options)};
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

function select(selectIndex, key, {z, fill, stroke, ...options}) {
  if (z === undefined) ([z] = maybeColor(fill));
  if (z === undefined) ([z] = maybeColor(stroke));
  return (data, facets) => {
    const I = range(data);
    const Z = valueof(data, z);
    const V = key && valueof(data, options[key]);
    const index = [];
    const selection = [];
    let k = 0;
    for (const facet of facets === undefined ? [I] : facets) {
      const facetIndex = [];
      index.push(facetIndex);
      for (const index of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selectIndex(index, V)) {
          facetIndex.push(k++);
          selection.push(data[i]);
        }
      }
    }
    return {
      index: facets === undefined ? index[0] : index,
      data: selection
    };
  };
}
