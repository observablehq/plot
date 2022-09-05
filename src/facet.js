import {cross, groups, InternMap} from "d3";
import {isObject, range, keyword} from "./options.js";

// facet filter, by mark
export function filterFacets({xFilter, yFilter}, facetChannels) {
  if (xFilter && yFilter) {
    const {
      fx: {value: vx},
      fy: {value: vy}
    } = facetChannels;
    const I = range(vx);
    const sy = new Set(vy);
    return Array.from(new Set(vx), (key) => {
      const J = xFilter(I, vx, key);
      return Array.from(sy, (key) => yFilter(J, vy, key));
    });
  }
  if (xFilter) {
    const {value} = facetChannels.fx;
    const I = range(value);
    return Array.from(new Set(value), (key) => xFilter(I, value, key));
  }
  if (yFilter) {
    const {value} = facetChannels.fy;
    const I = range(value);
    return Array.from(new Set(value), (key) => yFilter(I, value, key));
  }
}

export function maybeFacet(facet) {
  if (facet == null || facet === false) return null;
  if (facet === true) return "include";
  if (typeof facet === "string") return keyword(facet, "facet", ["auto", "include", "exclude"]);
  // local facets can be defined as facet: {x: accessor, xFilter: "lte"}
  if (!isObject(facet)) throw new Error(`Unsupported facet ${facet}`);
  const {xFilter, yFilter} = facet;
  return {
    ...(xFilter !== undefined && {xFilter: maybeFacetFilter(xFilter, "x")}),
    ...(yFilter !== undefined && {yFilter: maybeFacetFilter(yFilter, "y")})
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

// Returns an array of [[key1, index1], [key2, index2], …] representing the data
// indexes associated with each facet. For two-dimensional faceting, each key
// is a two-element array; see also facetMap.
export function facetGroups(index, {fx, fy}) {
  return fx && fy ? facetGroup2(index, fx, fy) : fx ? facetGroup1(index, fx) : facetGroup1(index, fy);
}

function facetGroup1(index, {value: F}) {
  return groups(index, (i) => F[i]);
}

function facetGroup2(index, {value: FX}, {value: FY}) {
  return groups(
    index,
    (i) => FX[i],
    (i) => FY[i]
  ).flatMap(([x, xgroup]) => xgroup.map(([y, ygroup]) => [[x, y], ygroup]));
}

// This must match the key structure returned by facetGroups.
export function facetTranslate(fx, fy) {
  return fx && fy
    ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx
    ? (kx) => `translate(${fx(kx)},0)`
    : (ky) => `translate(0,${fy(ky)})`;
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
