import {groups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, maybeValue, range, offsetRange} from "../mark.js";

export function group1(x) {
  const {value} = maybeValue({value: x});
  return (data, facets) => {
    const values = valueof(data, value);
    let g = groups(range(data), i => values[i]).filter(defined1);
    return regroup(g, facets);
  };
}

export function group2(vx, vy) {
  const {value: x} = maybeValue({value: vx});
  const {value: y} = maybeValue({value: vy});
  return (data, facets) => {
    const valuesX = valueof(data, x);
    const valuesY = valueof(data, y);
    let g = groups(range(data), i => valuesX[i], i => valuesY[i]).filter(defined1);
    g = g.flatMap(([x, xgroup]) => xgroup.filter(defined1).map(([y, ygroup]) => [x, y, ygroup]));
    return regroup(g, facets);
  };
}

// When faceting, subdivides the given groups according to the facet indexes.
function regroup(groups, facets) {
  if (facets === undefined) return {index: range(groups), data: groups};
  const index = [];
  const data = [];
  let k = 0;
  for (const facet of facets.map(subset)) {
    let g = groups.map(facet).filter(nonempty1);
    index.push(offsetRange(g, k));
    data.push(g);
    k += g.length;
  }
  return {index, data: data.flat()};
}

function subset(facet) {
  const f = new Set(facet);
  return ([key, group]) => [key, group.filter(i => f.has(i))];
}

// Since marks don’t render when channel values are undefined (or null or NaN),
// we apply the same logic when grouping. If you want to preserve the group for
// undefined data, map it to an “other” value first.
function defined1([key]) {
  return defined(key);
}

// When faceting, some groups may be empty; these are filtered out.
export function nonempty1([, {length}]) {
  return length > 0;
}
