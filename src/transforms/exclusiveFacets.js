import {lengthof, reindex, slice} from "../options.js";

export function exclusiveFacets(data, facets) {
  if (facets.length === 1) return {data, facets}; // only one facet; trivially exclusive

  const n = lengthof(data);
  const O = new Uint8Array(n);
  let overlaps = 0;

  // Count the number of overlapping indexes across facets.
  for (const facet of facets) {
    for (const i of facet) {
      if (O[i]) ++overlaps;
      O[i] = 1;
    }
  }

  // Do nothing if the facets are already exclusive.
  if (overlaps === 0) return {data, facets}; // facets are exclusive

  // For each overlapping index (duplicate), assign a new unique index at the
  // end of the existing array, duplicating the datum. For example, [[0, 1, 2],
  // [2, 1, 3]] would become [[0, 1, 2], [4, 5, 3]]. Also attach a reindex to
  // the data to preserve the association of channel values specified as arrays.
  data = slice(data);
  const R = (data[reindex] = new Uint32Array(n + overlaps));
  facets = facets.map((facet) => slice(facet, Uint32Array));
  let j = n;
  O.fill(0);
  for (const facet of facets) {
    for (let k = 0, m = facet.length; k < m; ++k) {
      const i = facet[k];
      if (O[i]) (facet[k] = j), (data[j] = data[i]), (R[j] = i), ++j;
      else R[i] = i;
      O[i] = 1;
    }
  }

  return {data, facets};
}
