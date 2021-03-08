import {greatest, group, least} from "d3-array";
import {maybeTransform, maybeZ, valueof} from "../mark.js";

export function selectFirst(options) {
  return {...options, transform: select(first, undefined, options)};
}

export function selectLast(options) {
  return {...options, transform: select(last, undefined, options)};
}

export function selectMinX({x, ...options} = {}) {
  return {...options, x, transform: select(min, x, options)};
}

export function selectMinY({y, ...options} = {}) {
  return {...options, y, transform: select(min, y, options)};
}

export function selectMaxX({x, ...options} = {}) {
  return {...options, x, transform: select(max, x, options)};
}

export function selectMaxY({y, ...options} = {}) {
  return {...options, y, transform: select(max, y, options)};
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

function select(selectIndex, v, options) {
  const z = maybeZ(options);
  return maybeTransform(options, (data, index) => {
    const Z = valueof(data, z);
    const V = valueof(data, v);
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
    return {data, index: selectedIndex};
  });
}
