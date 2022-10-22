import {group, intersection, sort} from "d3";
import {arrayify, range} from "./options.js";

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

// Returns keys in order of the associated scale’s domains.
export function facetKeys(facets, {fx, fy}) {
  const fxI = fx && new Map(fx.domain().map((x, i) => [x, i]));
  const fyI = fy && new Map(fy.domain().map((y, i) => [y, i]));
  return sort(
    facets,
    ({x: xa, y: ya}, {x: xb, y: yb}) => (fxI && fxI.get(xa) - fxI.get(xb)) || (fyI && fyI.get(ya) - fyI.get(yb))
  );
}

// Returns a (possibly nested) Map of [[key1, index1], [key2, index2], …]
// representing the data indexes associated with each facet.
export function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy) : fx ? facetGroup1(index, fx) : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return group(index, (i) => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return group(
    index,
    (i) => FX[i],
    (i) => FY[i]
  );
}

export function facetTranslate(fx, fy) {
  return fx && fy
    ? ({x, y}) => `translate(${fx(x)},${fy(y)})`
    : fx
    ? ({x}) => `translate(${fx(x)},0)`
    : ({y}) => `translate(0,${fy(y)})`;
}
