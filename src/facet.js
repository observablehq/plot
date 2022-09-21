import {isTypedArray, slice} from "./options.js";

export function facetReindex(facets, data, channels) {
  const n = data.length;

  // Count the number of overlapping indexes across facets.
  const overlap = new Uint8Array(n);
  let count = 0;
  for (const facet of facets) {
    for (const i of facet) {
      if (overlap[i]) ++count;
      overlap[i] = 1;
    }
  }

  // With certain facet filters (particularly cumulative ones such as lte), the
  // number of overlaps can be O(n^2) of the original input data of size n.
  if (n + count > 2 ** 30) throw new Error("facets too big");

  // For each overlapping index (duplicate number), assign a new unique index at
  // the end of the existing array. For example, [[0, 1, 2], [2, 1, 3]] would
  // become [[0, 1, 2], [4, 5, 3]]. Copy the duplicate references of data, and
  // any input channels specified as arrays, into similarly expanded arrays.
  // TODO If the input channel is specified as a function, its behavior might
  // also depend on the index, so we need to materialize the array before doing
  // the expansion.
  if (count > 0) {
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
