import {cross, group, sum} from "d3";
import {range} from "./options.js";
import {Scales} from "./scales.js";

// Returns an array of {x?, y?, i} objects representing the facet domain.
export function Facets(channelsByScale, options) {
  const {fx, fy} = Scales(channelsByScale, options);
  const fxDomain = fx?.scale.domain();
  const fyDomain = fy?.scale.domain();
  return fxDomain && fyDomain
    ? cross(fxDomain, fyDomain).map(([x, y], i) => ({x, y, i}))
    : fxDomain
    ? fxDomain.map((x, i) => ({x, i}))
    : fyDomain
    ? fyDomain.map((y, i) => ({y, i}))
    : undefined;
}

// Returns an accessor function that returns the order of the given facet value
// in the associated facet scales’ domains.
export function facetOrder({x: X, y: Y}) {
  const xi = X && new Map(X.map((v, i) => [v, i]));
  const yi = Y && new Map(Y.map((v, i) => [v, i]));
  return X && Y
    ? (a, b) => xi.get(a.x) - xi.get(b.x) || yi.get(a.y) - yi.get(b.y)
    : X
    ? (a, b) => xi.get(a.x) - xi.get(b.x)
    : (a, b) => yi.get(a.y) - yi.get(b.y);
}

// Returns a (possibly nested) Map of [[key1, index1], [key2, index2], …]
// representing the data indexes associated with each facet.
export function facetGroups(data, {fx, fy}) {
  const index = range(data);
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

// Returns an index that for each facet lists all the elements present in other
// facets in the original index. TODO Memoize to avoid repeated work?
export function facetExclude(index) {
  const ex = [];
  const e = new Uint32Array(sum(index, (d) => d.length));
  for (const i of index) {
    let n = 0;
    for (const j of index) {
      if (i === j) continue;
      e.set(j, n);
      n += j.length;
    }
    ex.push(e.slice(0, n));
  }
  return ex;
}

const facetAnchors = new Map([
  ["top", facetAnchorTop],
  ["right", facetAnchorRight],
  ["bottom", facetAnchorBottom],
  ["left", facetAnchorLeft],
  ["top-left", or(facetAnchorTop, facetAnchorLeft)],
  ["top-right", or(facetAnchorTop, facetAnchorRight)],
  ["bottom-left", or(facetAnchorBottom, facetAnchorLeft)],
  ["bottom-right", or(facetAnchorBottom, facetAnchorRight)],
  ["top-middle", or(facetAnchorTop, facetAnchorXMid)],
  ["right-middle", or(facetAnchorRight, facetAnchorYMid)],
  ["bottom-middle", or(facetAnchorBottom, facetAnchorXMid)],
  ["left-middle", or(facetAnchorLeft, facetAnchorYMid)],
  ["middle", or(facetAnchorXMid, facetAnchorYMid)],
  ["top-empty", facetAnchorTopEmpty],
  ["right-empty", facetAnchorRightEmpty],
  ["bottom-empty", facetAnchorBottomEmpty],
  ["left-empty", facetAnchorLeftEmpty]
]);

export function maybeFacetAnchor(facetAnchor) {
  if (facetAnchor == null) return null;
  const anchor = facetAnchors.get(`${facetAnchor}`.toLowerCase());
  if (anchor) return anchor;
  throw new Error(`invalid facet anchor: ${facetAnchor}`);
}

function facetAnchorTop(facets, {y: Y}, {y}) {
  return Y?.indexOf(y) !== 0;
}

function facetAnchorBottom(facets, {y: Y}, {y}) {
  return Y?.indexOf(y) !== Y?.length - 1;
}

function facetAnchorLeft(facets, {x: X}, {x}) {
  return X?.indexOf(x) !== 0;
}

function facetAnchorRight(facets, {x: X}, {x}) {
  return X?.indexOf(x) !== X?.length - 1;
}

function facetAnchorXMid(facets, {x: X}, {x}) {
  return X?.indexOf(x) !== X?.length >> 1;
}

function facetAnchorYMid(facets, {y: Y}, {y}) {
  return Y?.indexOf(y) !== Y?.length >> 1;
}

function facetAnchorTopEmpty(facets, {y: Y}, {x, y}) {
  const i = Y?.indexOf(y);
  if (i > 0) {
    const y = Y[i - 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorBottomEmpty(facets, {y: Y}, {x, y}) {
  const i = Y?.indexOf(y);
  if (i < Y?.length - 1) {
    const y = Y[i + 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorLeftEmpty(facets, {x: X}, {x, y}) {
  const i = X?.indexOf(x);
  if (i > 0) {
    const x = X[i - 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function facetAnchorRightEmpty(facets, {x: X}, {x, y}) {
  const i = X?.indexOf(x);
  if (i < X?.length - 1) {
    const x = X[i + 1];
    return !facets.find((f) => f.x === x && f.y === y)?.empty;
  }
}

function or(a, b) {
  return function () {
    return a.apply(null, arguments) || b.apply(null, arguments);
  };
}

// Facet filter, by mark; for now only the "eq" filter is provided.
export function facetFilter(facets, {channels: {fx, fy}, groups}) {
  return fx && fy
    ? facets.map(({x, y}) => groups.get(x)?.get(y) ?? [])
    : fx
    ? facets.map(({x}) => groups.get(x) ?? [])
    : facets.map(({y}) => groups.get(y) ?? []);
}
