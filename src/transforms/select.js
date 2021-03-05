import {greatest, group, least} from "d3-array";
import {maybeColor, range, valueof} from "../mark.js";

export function selectFirst(options) {
  return select(first, undefined, options);
}

export function selectLast(options) {
  return select(last, undefined, options);
}

export function selectMinX(options) {
  return select(min, "x", options);
}

export function selectMinY(options) {
  return select(min, "y", options);
}

export function selectMaxX(options) {
  return select(max, "x", options);
}

export function selectMaxY(options) {
  return select(max, "y", options);
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

function select(selectIndex, key, options) {
  return (data, facets, channels) => {
    const {z, fill, stroke, [key]: v} = {...channels, ...options};
    if (z === undefined) ([z] = maybeColor(fill));
    if (z === undefined) ([z] = maybeColor(stroke));
    const I = range(data);
    const Z = valueof(data, z);
    const V = key && valueof(data, v);
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
      data: selection,
      channels: {z: Z, [key]: V}
    };
  };
}
