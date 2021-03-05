import {greatest, group, least} from "d3-array";
import {maybeColor, valueof} from "../mark.js";

export function selectFirst() {
  return select(first, undefined);
}

export function selectLast() {
  return select(last, undefined);
}

export function selectMinX() {
  return select(min, "x");
}

export function selectMinY() {
  return select(min, "y");
}

export function selectMaxX() {
  return select(max, "x");
}

export function selectMaxY() {
  return select(max, "y");
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

function select(selectIndex, key) {
  return (data, index, {z, fill, stroke, [key]: v}) => {
    if (z === undefined) ([z] = maybeColor(fill));
    if (z === undefined) ([z] = maybeColor(stroke));
    const Z = valueof(data, z);
    const V = key && valueof(data, v);
    const selectedIndex = [];
    for (const facet of index) {
      const selectedFacet = [];
      for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selectIndex(I, V)) {
          selectedFacet.push(i);
        }
      }
      selectedIndex.push(selectedFacet);
    }
    return {
      index: selectedIndex,
      data,
      channels: {
        z: Z,
        [key]: V
      }
    };
  };
}
