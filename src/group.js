import {InternMap} from "d3-array";

// Like d3.group, but takes an array of values instead of accessor, only
// supports one level of grouping, and returns an iterable of subsets of the
// given index rather than a map.
export function group(index, values) {
  const groups = new InternMap();
  for (const i of index) {
    const value = values[i];
    const group = groups.get(value);
    if (group === undefined) groups.set(value, [i]);
    else group.push(i);
  }
  return groups.values();
}
