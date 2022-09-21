import {isTypedArray, slice} from "./options.js";

export function facetReindex(facets, n) {
  // Count the number of overlapping indexes across facets.
  const overlap = new Uint8Array(n);
  let count = 0;
  for (const facet of facets) {
    for (const i of facet) {
      if (overlap[i]) ++count;
      overlap[i] = 1;
    }
  }

  // For each overlapping index (duplicate number), assign a new unique index at
  // the end of the existing array. For example, [[0, 1, 2], [2, 1, 3]] would
  // become [[0, 1, 2], [4, 5, 3]]. Attach a reindex function to the facet
  // array, to be able to read the values associated with the old index in
  // unaffected channels.
  if (count > 0) {
    facets = facets.map((facet) => slice(facet, Uint32Array));
    const plan = new Uint32Array(count);
    const reindex = (i) => (i < n ? i : plan[i - n]);
    let c = 0;
    overlap.fill(0);
    for (const [j, facet] of facets.entries()) {
      if (j) facet.reindex = reindex;
      for (let k = 0; k < facet.length; ++k) {
        const i = facet[k];
        if (overlap[i]) {
          plan[c] = i;
          facet[k] = n + c;
          ++c;
        }
        overlap[i] = 1;
      }
    }
  }
  return {facets, n: n + count};
}
