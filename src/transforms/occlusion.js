import {bisector, group} from "d3";
import {valueof} from "../options.js";
import {initializer} from "./basic.js";

export function occlusionX(occlusionOptions = {}, options = {}) {
  if (arguments.length === 1) [occlusionOptions, options] = mergeOptions(occlusionOptions);
  const {minDistance = 11} = maybeDistance(occlusionOptions);
  return occlusion("x", "y", minDistance, options);
}

export function occlusionY(occlusionOptions = {}, options = {}) {
  if (arguments.length === 1) [occlusionOptions, options] = mergeOptions(occlusionOptions);
  const {minDistance = 11} = maybeDistance(occlusionOptions);
  return occlusion("y", "x", minDistance, options);
}

function maybeDistance(minDistance) {
  return typeof minDistance === "number" ? {minDistance} : minDistance;
}
function mergeOptions({minDistance, ...options}) {
  return [{minDistance}, options];
}

function occlusion(k, h, minDistance, options) {
  const sk = k[0]; // e.g., the scale for x1 is x
  if (typeof minDistance !== "number" || !(minDistance >= 0)) throw new Error(`unsupported minDistance ${minDistance}`);
  if (minDistance === 0) return options;
  return initializer(options, function (data, facets, {[k]: channel}, {[sk]: s}) {
    const {value, scale} = channel ?? {};
    if (value === undefined) throw new Error(`missing channel ${k}`);
    const K = value.slice();
    const H = valueof(data, options[h]);
    const bisect = bisector((d) => d.lo).left;

    for (const facet of facets) {
      for (const index of H ? group(facet, (i) => H[i]).values() : [facet]) {
        const groups = [];
        for (const i of index) {
          if (scale === sk) K[i] = s(K[i]);
          let j = bisect(groups, K[i]);
          groups.splice(j, 0, {lo: K[i], hi: K[i], items: [i]});

          // Merge overlapping groups.
          while (
            groups[j + 1]?.lo < groups[j].hi + minDistance ||
            (groups[j - 1]?.hi > groups[j].lo - minDistance && (--j, true))
          ) {
            const items = groups[j].items.concat(groups[j + 1].items);
            const mid = (Math.min(groups[j].lo, groups[j + 1].lo) + Math.max(groups[j].hi, groups[j + 1].hi)) / 2;
            const w = (minDistance * (items.length - 1)) / 2;
            groups.splice(j, 2, {lo: mid - w, hi: mid + w, items});
          }
        }

        // Reposition elements within each group.
        for (const {lo, hi, items} of groups) {
          if (items.length > 1) {
            const dist = (hi - lo) / (items.length - 1);
            items.sort((i, j) => K[i] - K[j]);
            let p = lo;
            for (const i of items) (K[i] = p), (p += dist);
          }
        }
      }
    }

    return {data, facets, channels: {[k]: {value: K}}};
  });
}
