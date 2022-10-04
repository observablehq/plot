import {column, slice, valueof} from "./options.js";

export function facetReindex(facets, n) {
  if (facets.length === 1) return {facets};
  const overlap = new Uint8Array(n);
  let count = 0;
  let plan;

  // Count the number of overlapping indexes across facets.
  for (const facet of facets) {
    for (const i of facet) {
      if (i >= n) return {facets}; // already dedup'ed!
      if (overlap[i]) ++count;
      overlap[i] = 1;
    }
  }

  // For each overlapping index (duplicate number), assign a new unique index at
  // the end of the existing array. For example, [[0, 1, 2], [2, 1, 3]] would
  // become [[0, 1, 2], [4, 5, 3]]. Attach a plan to the facets array, to be
  // able to read the values associated with the old index in unaffected
  // channels.
  if (count > 0) {
    facets = facets.map((facet) => slice(facet, Uint32Array));
    plan = new Uint32Array(n + count);
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

  return {facets, plan};
}

export function maybeExpand(X, plan) {
  if (!X || !plan) return X;
  const V = new X.constructor(plan.length);
  for (let i = 0; i < plan.length; ++i) V[i] = X[plan[i]];
  return V;
}

// Iterate over the options and pull out any that represent columns of values.
const knownChannels = [
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
  "z",
  "ariaLabel",
  "href",
  "title",
  "fill",
  "stroke",
  "fillOpacity",
  "strokeOpacity",
  "opacity",
  "strokeWidth",
  "symbol", // dot
  "r", // dot
  "rotate", // dot, text
  "fontSize", // text
  "text", // text
  "length", // vector
  "width", // image
  "height", // image
  "src", // image
  "weight" // density
];

export function maybeExpandChannels(options) {
  const channels = {};
  const [{transform: plan}, setPlan] = column();
  for (const name of knownChannels) {
    let value = options[name];
    if (value != null) {
      if (value.definition) continue; // already planned
      channels[name] = {
        definition: value,
        transform: (data) => maybeExpand(valueof(data, value), plan())
      };
    }
  }
  return [channels, setPlan];
}
