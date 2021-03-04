import {greatest, group, least} from "d3-array";
import {maybeColor, range, valueof} from "../mark.js";

export function first(options = {}) {
  return {...options, transform: select(selectFirst, undefined, options)};
}

export function last(options = {}) {
  return {...options, transform: select(selectLast, undefined, options)};
}

export function minX(options = {}) {
  return {...options, transform: select(selectMin, "x", options)};
}

export function minY(options = {}) {
  return {...options, transform: select(selectMin, "y", options)};
}

export function maxX(options = {}) {
  return {...options, transform: select(selectMax, "x", options)};
}

export function maxY(options = {}) {
  return {...options, transform: select(selectMax, "y", options)};
}

function* selectFirst(I) {
  yield I[0];
}

function* selectLast(I) {
  yield I[I.length - 1];
}

function* selectMin(I, X) {
  yield least(I, i => X[i]);
}

function* selectMax(I, X) {
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
