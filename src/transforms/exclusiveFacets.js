import {slice} from "../options.js";

// TODO How to reindex channels supplied as arrays? I don’t want to inspect
// arbitrary values on the options; maybe we could use this.channels?
export function exclusiveFacets(data, facets) {
  if (facets.length === 1) return {data, facets}; // only one facet; trivially exclusive

  const n = data.length;
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
  // [2, 1, 3]] would become [[0, 1, 2], [4, 5, 3]].
  data = slice(data);
  // Attach a reindex map to the data, to interpret channels specified as arrays.
  data.reindex = new Uint32Array(n + overlaps);
  facets = facets.map((facet) => slice(facet, Uint32Array));
  let j = n;
  O.fill(0);
  for (const facet of facets) {
    for (let k = 0, m = facet.length; k < m; ++k) {
      const i = facet[k];
      if (O[i]) (facet[k] = j), (data[j] = data[i]), (data.reindex[j] = i), ++j;
      else data.reindex[i] = i;
      O[i] = 1;
    }
  }

  return {data, facets};
}
