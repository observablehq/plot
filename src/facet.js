import {group, intersection, sort} from "d3";
import {arrayify, keyword, range} from "./options.js";

export function maybeFacet({fx, fy, facet = "auto"} = {}) {
  if (facet === null || facet === false) return null;
  if (facet === true) facet = "include";
  return {x: fx, y: fy, method: keyword(facet, "facet", ["auto", "include", "exclude"])};
}

// Facet filter, by mark; for now only the "eq" filter is provided.
export function filterFacets(facets, {fx, fy}) {
  const X = fx != null && fx.value;
  const Y = fy != null && fy.value;
  const index = range(X || Y);
  const gx = X && group(index, (i) => X[i]);
  const gy = Y && group(index, (i) => Y[i]);
  return X && Y
    ? facets.map(({x, y}) => arrayify(intersection(gx.get(x) ?? [], gy.get(y) ?? [])))
    : X
    ? facets.map(({x}) => gx.get(x) ?? [])
    : facets.map(({y}) => gy.get(y) ?? []);
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
