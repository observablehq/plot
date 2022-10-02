// Make sure the facets are exclusive, possibly by creating a rectangular index
// of size m * n, where m is the number of facets, and n the data’s length
export function facetExclusive(facets, n) {
  const overlap = new Uint8Array(n);
  const m = facets.length;
  let max = -Infinity;
  for (const facet of facets) {
    for (const i of facet) {
      if (overlap[i]) return {facets: facets.map((f, i) => f.map((d) => d + i * n)), n: m * n};
      overlap[i] = 1;
      if (i > max) max = i;
    }
  }
  // If the facets were already expanded, return a sufficient multiple of n
  return {facets, n: n * (1 + Math.floor(max / n))};
}
