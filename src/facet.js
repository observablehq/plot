import {group, intersection, sort, sum} from "d3";
import {arrayify, range} from "./options.js";
import {Channel} from "./channel.js";
import {warn} from "./warnings.js";

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

// Returns an index that for each facet lists all the elements present in other
// facets in the original index
export function excludeIndex(index) {
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

// Returns the facet groups, and possibly fx and fy channels, associated to the
// top-level facet options {data, x, y}
export function topFacetRead(facet) {
  if (facet == null) return;
  const {x, y} = facet;
  if (x != null || y != null) {
    const data = arrayify(facet.data);
    if (data == null) throw new Error(`missing facet data`); // TODO strict equality
    const fx = x != null ? Channel(data, {value: x, scale: "fx"}) : undefined;
    const fy = y != null ? Channel(data, {value: y, scale: "fy"}) : undefined;
    const groups = facetGroups(range(data), {fx, fy});
    // If the top-level faceting is non-trivial, track the corresponding data
    // length, in order to compare it for the warning above.
    const facetChannelLength =
      groups.size > 1 || (fx && fy && groups.size === 1 && [...groups][0][1].size > 1) ? data.length : undefined;
    return {groups, fx, fy, facetChannelLength};
  }
}

// Returns the facet groups, and possibly fx and fy channels, associated to a
// mark, either through top-level faceting or mark-level facet options {fx, fy}
export function facetRead(mark, facetOptions, topFacetInfo) {
  if (mark.facet === null) return;

  // This mark defines a mark-level facet.
  const {fx: x, fy: y} = mark;
  if (x != null || y != null) {
    const data = arrayify(mark.data);
    if (data == null) throw new Error(`missing facet data in ${mark.ariaLabel}`); // TODO strict equality
    const fx = x != null ? Channel(data, {value: x, scale: "fx"}) : undefined;
    const fy = y != null ? Channel(data, {value: y, scale: "fy"}) : undefined;
    return {groups: facetGroups(range(data), {fx, fy}), fx, fy};
  }

  // This mark links to a top-level facet, if present.
  if (topFacetInfo === undefined) return;

  const {groups, facetChannelLength} = topFacetInfo;
  if (mark.facet !== "auto" || mark.data === facetOptions.data) return {groups};

  // Warn for the common pitfall of wanting to facet mapped data. See
  // above for the initialization of facetChannelLength.
  if (facetChannelLength !== undefined && arrayify(mark.data)?.length === facetChannelLength) {
    warn(
      `Warning: the ${mark.ariaLabel} mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.`
    );
  }
}
