import {keyword, isObject, isTypedArray, range, slice, valueof} from "./options.js";
import {warn} from "./warnings.js";

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

// This must match the key structure of facetCells
export function facetTranslate(fx, fy) {
  return fx && fy
    ? ([kx, ky]) => `translate(${fx(kx)},${fy(ky)})`
    : fx
    ? ([kx]) => `translate(${fx(kx)},0)`
    : ([, ky]) => `translate(0,${fy(ky)})`;
}

export function facetReindex(facets, data, channels) {
  const n = data.length;

  // Survey all indices which belong to multiple facets
  const overlap = new Uint8Array(n);
  let count = 0;
  for (const facet of facets) {
    for (const i of facet) {
      if (overlap[i]) ++count;
      overlap[i] = 1;
    }
  }

  // Create a new index for each of them, and update the facets accordingly.
  // Expand the data array to match. If any channel is specified as an array,
  // expand it as well, taking care not to mutate the original channels
  if (n + count > 2 ** 30) {
    warn("This transform implies a combinatorial extension that exceeds capacity. Please change the facet filter.");
  } else if (count > 0) {
    facets = facets.map((facet) => slice(facet, Uint32Array));
    const reindex = new Uint32Array(count);
    let c = 0;
    overlap.fill(0);
    for (const facet of facets) {
      for (let k = 0; k < facet.length; ++k) {
        const i = facet[k];
        if (overlap[i]) {
          reindex[c] = i;
          facet[k] = n + c;
          ++c;
        }
        overlap[i] = 1;
      }
    }
    data = expandArray(data, count);
    for (let i = 0; i < count; ++i) data[n + i] = data[reindex[i]];
    for (const key in channels) {
      const A = channels[key].value;
      if (Array.isArray(A) || isTypedArray(A)) {
        channels = {...channels}; // avoid mutation
        channels[key].value = (_, i) => A[i < n ? i : reindex[i - n]];
      }
    }
  }

  return {facets, data, channels};
}

// expands an array or typed array to make room for n more values
function expandArray(values, n) {
  if (isTypedArray(values)) {
    const d = new values.constructor(values.length + n);
    d.set(values);
    return d;
  }
  return slice(values);
}
