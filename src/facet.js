import {group, intersection, sort} from "d3";
import {arrayify, keyword, range} from "./options.js";

export function maybeFacet({fx, fy, xFilter, yFilter, facet = "auto"} = {}) {
  if (facet === null || facet === false) return null;
  if (facet === true) facet = "include";
  return {
    x: fx,
    y: fy,
    xFilter: maybeFacetFilter(xFilter),
    yFilter: maybeFacetFilter(yFilter),
    method: keyword(facet, "facet", ["auto", "include", "exclude"])
  };
}

// Facet filter, by mark; if a filter is provided, sort the keys and apply.
export function filterFacets(facets, {fx, fy}, {xFilter, yFilter}) {
  const X = fx != null && fx.value;
  const Y = fy != null && fy.value;
  const index = range(X || Y);
  const gx = filteredFacet(X && group(index, (i) => X[i]), xFilter);
  const gy = filteredFacet(Y && group(index, (i) => Y[i]), yFilter);

  return X && Y
    ? facets.map(({x, y}) => arrayify(intersection(gx(x), gy(y))))
    : X
    ? facets.map(({x}) => gx(x) ?? [])
    : facets.map(({y}) => gy(y) ?? []);
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

function filteredFacet(g, test) {
  if (!g) return;
  if (test === undefined) return (x) => g.get(x) ?? [];
  return (x) => Array.from(g, ([key, index]) => (test(key, x) ? index : [])).flat();
}

function maybeFacetFilter(filter = "eq") {
  if (typeof filter === "function" && filter.length === 2) return filter;
  switch (filter) {
    case "eq":
      return undefined;
    case "lte":
      return (a, b) => a <= b;
    case "lt":
      return (a, b) => a < b;
    case "gte":
      return (a, b) => a >= b;
    case "gt":
      return (a, b) => a > b;
  }
  throw new Error(`unsupported facet filter: ${filter}`);
}
