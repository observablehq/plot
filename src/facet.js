import {group, sort} from "d3";
import {keyword, range} from "./options.js";

export function maybeFacet({fx, fy, facet = "auto"} = {}) {
  if (facet === null || facet === false) return null;
  if (facet === true) facet = "include";
  return {x: fx, y: fy, method: keyword(facet, "facet", ["auto", "include", "exclude"])};
}

// facet filter, by mark
export function filterFacets(facets, {fx, fy}) {
  const vx = fx != null && fx.value;
  const vy = fy != null && fy.value;
  if (!vx && !vy) return;
  const index = range(vx || vy);
  return facets.map(({x, y}) => {
    let I = index;
    if (vx) I = I.filter((i) => facetKeyEquals(vx[i], x));
    if (vy) I = I.filter((i) => facetKeyEquals(vy[i], y));
    return I;
  });
}

// test if a value equals a facet key
export function facetKeyEquals(a, b) {
  return a instanceof Date && b instanceof Date ? +a === +b : a === b;
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
export function facetKeys(facets, {fx, fy}) {
  const fxI = fx && new Map(fx.domain().map((x, i) => [x, i]));
  const fyI = fy && new Map(fy.domain().map((y, i) => [y, i]));
  return sort(
    facets,
    ({x: xa, y: ya}, {x: xb, y: yb}) => (fxI && fxI.get(xa) - fxI.get(xb)) || (fyI && fyI.get(ya) - fyI.get(yb))
  );
}

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array.
export function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy) : fx ? facetGroup1(index, fx) : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return group(index, (i) => F[i]); //.map(([k, group]) => [{[x]: k}, group]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return group(
    index,
    (i) => FX[i],
    (i) => FY[i]
  ); //.flatMap(([x, xgroup]) => xgroup.map(([y, ygroup]) => [{x, y}, ygroup]));
}

// This must match the key structure returned by facetGroups.
export function facetTranslate(fx, fy) {
  return fx && fy
    ? ({x, y}) => `translate(${fx(x)},${fy(y)})`
    : fx
    ? ({x}) => `translate(${fx(x)},0)`
    : ({y}) => `translate(0,${fy(y)})`;
}
