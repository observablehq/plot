import {cross, group, InternMap} from "d3";
import {isObject, range, keyword, valueof} from "./options.js";

// facet filter, by mark
export function filterFacets(facetCells, {x, xFilter, y, yFilter}, facetChannels) {
  const vx = x != null ? x : facetChannels?.fx?.value;
  const vy = y != null ? y : facetChannels?.fy?.value;
  const I = range(vx || vy);
  return facetCells.map(([x, y]) => {
    let index = I;
    if (xFilter && vx) index = xFilter(index, vx, x);
    if (yFilter && vy) index = yFilter(index, vy, y);
    return index;
  });
}

export function maybeFacet(facet, data) {
  if (facet == null || facet === false) return null;
  if (facet === true) return "include";
  if (typeof facet === "string") return keyword(facet, "facet", ["auto", "include", "exclude"]);
  // local facets can be defined as facet: {x: accessor, xFilter: "lte"}
  if (!isObject(facet)) throw new Error(`Unsupported facet ${facet}`);
  const {x, xFilter = "eq", y, yFilter = "eq"} = facet;
  return {
    ...(x !== undefined && {x: valueof(data, x)}),
    ...(y !== undefined && {y: valueof(data, y)}),
    xFilter: maybeFacetFilter(xFilter, "x"),
    yFilter: maybeFacetFilter(yFilter, "y")
  };
}

function maybeFacetFilter(filter = "eq", x /* string */) {
  if (typeof filter === "function") return facetFunction(filter);
  switch (`${filter}`.toLowerCase()) {
    case "lt":
      return facetLt;
    case "lte":
      return facetLte;
    case "gt":
      return facetGt;
    case "gte":
      return facetGte;
    case "eq":
      return facetEq;
  }
  throw new Error(`invalid ${x} filter: ${filter}`);
}

function facetFunction(f) {
  return (I, T, facet) => {
    return I.filter((i) => f(T[i], facet));
  };
}

function facetLt(I, T, facet) {
  return I.filter((i) => T[i] < facet);
}

function facetLte(I, T, facet) {
  return I.filter((i) => T[i] <= facet);
}

function facetGt(I, T, facet) {
  return I.filter((i) => T[i] > facet);
}

function facetGte(I, T, facet) {
  return I.filter((i) => T[i] >= facet);
}

function facetEq(I, T, facet) {
  return I.filter((i) => T[i] === facet);
}

// Unlike facetGroups, which returns groups in order of input data, this returns
// keys in order of the associated scale’s domains.
export function facetKeys({fx, fy}) {
  return fx && fy ? cross(fx.domain(), fy.domain()) : fx ? fx.domain() : fy.domain();
}

// Returns an array of [[keys1, index1], [keys2, index2], …] representing the
// data indexes associated with each facet. The keys are written in an object
// {x, y…}, depending on the channels that were passed in the second argument
export function facetGroups(I, {fx, fy}) {
  let groups = [[{}, I]];
  if (fx) {
    groups = groups.flatMap(([key, I]) =>
      Array.from(
        group(I, (i) => fx.value[i]),
        ([fx, I]) => [{...key, fx}, I]
      )
    );
  }
  if (fy) {
    groups = groups.flatMap(([key, I]) =>
      Array.from(
        group(I, (i) => fy.value[i]),
        ([fy, I]) => [{...key, fy}, I]
      )
    );
  }
  return groups;
}

// This must match the key structure returned by facetGroups.
export function facetTranslate(fx, fy) {
  return fx && fy
    ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx
    ? ([kx]) => `translate(${fx(kx)},0)`
    : ([, ky]) => `translate(0,${fy(ky)})`;
}

export function facetMap({fx, fy}) {
  return new (fx && fy ? FacetMap2 : FacetMap)();
}

class FacetMap {
  constructor() {
    this._ = new InternMap();
  }
  has(key) {
    return this._.has(key);
  }
  get(key) {
    return this._.get(key);
  }
  set(key, value) {
    return this._.set(key, value), this;
  }
}

// A Map-like interface that supports paired keys.
class FacetMap2 extends FacetMap {
  has([key1, key2]) {
    const map = super.get(key1);
    return map ? map.has(key2) : false;
  }
  get([key1, key2]) {
    const map = super.get(key1);
    return map && map.get(key2);
  }
  set([key1, key2], value) {
    const map = super.get(key1);
    if (map) map.set(key2, value);
    else super.set(key1, new InternMap([[key2, value]]));
    return this;
  }
}
