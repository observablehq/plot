import {column, maybeColorChannel, maybeNumberChannel, slice, valueof} from "./options.js";
import {maybeSymbolChannel} from "./symbols.js";
import {maybeFontSizeChannel} from "./marks/text.js";
import {maybePathChannel} from "./marks/image.js";

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
  ["x"],
  ["x1"],
  ["x2"],
  ["y"],
  ["y1"],
  ["y2"],
  ["z"],
  ["ariaLabel"],
  ["href"],
  ["title"],
  ["fill", (value) => maybeColorChannel(value)[0]],
  ["stroke", (value) => maybeColorChannel(value)[0]],
  ["fillOpacity", (value) => maybeNumberChannel(value)[0]],
  ["strokeOpacity", (value) => maybeNumberChannel(value)[0]],
  ["opacity", (value) => maybeNumberChannel(value)[0]],
  ["strokeWidth", (value) => maybeNumberChannel(value)[0]],
  ["symbol", (value) => maybeSymbolChannel(value)[0]], // dot
  ["r", (value) => maybeNumberChannel(value)[0]], // dot
  ["rotate", (value) => maybeNumberChannel(value)[0]], // dot, text
  ["fontSize", (value) => maybeFontSizeChannel(value)[0]], // text
  ["text"], // text
  ["length", (value) => maybeNumberChannel(value)[0]], // vector
  ["width", (value) => maybeNumberChannel(value)[0]], // image
  ["height", (value) => maybeNumberChannel(value)[0]], // image
  ["src", (value) => maybePathChannel(value)[0]], // image
  ["weight", (value) => maybeNumberChannel(value)[0]] // density
];

export function maybeExpandOutputs(options) {
  const other = {};
  const outputs = [];
  for (const [name, test = (value) => value] of knownChannels) {
    const value = test(options[name]);
    if (value != null) {
      const [V, setV] = column(value);
      other[name] = V;
      outputs.push((data, plan) => setV(maybeExpand(valueof(data, value), plan)));
    }
  }
  return [other, outputs];
}
