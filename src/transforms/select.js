import {greatest, group, least} from "d3-array";
import {maybeZ, valueof} from "../mark.js";

export function selectFirst() {
  return select(first);
}

export function selectLast() {
  return select(last);
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

// TODO If the value (for some required channel) is undefined, scan forward?
function* first(I) {
  yield I[0];
}

// TODO If the value (for some required channel) is undefined, scan backward?
function* last(I) {
  yield I[I.length - 1];
}

function* min(I, X) {
  yield least(I, i => X[i]);
}

function* max(I, X) {
  yield greatest(I, i => X[i]);
}

function select(selector, key) {
  return (data, index, input) => {
    const Z = valueof(data, maybeZ(input));
    const V = key && valueof(data, v);
    const selectedIndex = [];
    const selectedData = [];
    for (const facet of index) {
      const selectedFacet = [];
      for (const I of Z ? group(facet, i => Z[i]).values() : [facet]) {
        for (const i of selector(I, V)) {
          selectedFacet.push(i);
          selectedData.push(data[i]);
        }
      }
      selectedIndex.push(selectedFacet);
    }
    return {
      index: selectedIndex,
      data: selectedData,
      channels: {z: Z, ...key && {[key]: V}}
    };
  };
}
