import {labelof, slice, valueof} from "./options.js";
import {knownChannels} from "./channel.js";

function facetReindex(facets, n) {
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
function maybeExpandChannels(options) {
  const channels = {};
  let data, plan;
  for (const [name, {definition = (value) => [value]}] of knownChannels) {
    const value = definition(options[name])[0];
    if (value != null) {
      channels[name] = {
        transform: () => maybeExpand(valueof(data, value), plan),
        label: labelof(value)
      };
    }
  }
  return [channels, (v) => ({data, plan} = v)];
}

export function exclusiveFacets(options) {
  const [other, setPlan] = maybeExpandChannels(options);
  return [
    other,
    (facets, data) => {
      let plan;
      ({facets, plan} = facetReindex(facets, data.length));
      setPlan({data, plan});
      return {facets, plan, n: plan ? plan.length : data.length};
    }
  ];
}
