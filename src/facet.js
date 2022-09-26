import {max} from "d3";
import {slice} from "./options.js";

export function facetReindex(facets) {
  // Count the number of overlapping indexes across facets.
  let n = max(facets, (facet) => max(facet)) + 1;
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
    const plan = (facets.plan = new Uint32Array(n + count));
    let j = 0;
    for (; j < n; ++j) plan[j] = j;
    overlap.fill(0);
    for (const facet of facets) {
      for (let k = 0; k < facet.length; ++k) {
        const i = facet[k];
        if (overlap[i]) {
          plan[j] = i;
          facet[k] = j;
          j++;
        }
        overlap[i] = 1;
      }
    }
  }
  return facets;
}

// returns a function that reads X with the facets’ reindexing plan
export function getter({plan}, X) {
  return !plan || X.length === plan.length ? (i) => X[i] : (i) => X[plan[i]];
}

// returns an array of X expanded along the facets’ reindexing plan
export function expander({plan}, X) {
  if (!plan || X.length === plan.length) return X;
  const V = new X.constructor(plan.length);
  for (let i = 0; i < plan.length; ++i) V[i] = X[plan[i]];
  return V;
}
