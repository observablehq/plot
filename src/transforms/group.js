import {groups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, range, offsetRange, maybeLabel, first, second, identity} from "../mark.js";

export function groupX({x, normalize, ...options} = {}) {
  const [transform, X, y] = group1(x, normalize);
  return {...options, transform, x: X, y};
}

export function groupY({y, normalize, ...options} = {}) {
  const [transform, Y, x] = group1(y, normalize);
  return {...options, transform, y: Y, x};
}

function group1(x = identity, k) {
  const y = (k = k === true ? 100 : +k) ? normalizedLength2(k) : length2;
  return [
    (data, facets) => {
      if (k) y.normalize(data);
      const X = valueof(data, x);
      let g = groups(range(data), i => X[i]).filter(defined1);
      return regroup(g, facets);
    },
    maybeLabel(first, x),
    y
  ];
}

export function group({x = first, y = second, out, ...options} = {}) {
  return {
    ...options,
    transform(data, facets) {
      const X = valueof(data, x);
      const Y = valueof(data, y);
      let g = groups(range(data), i => X[i], i => Y[i]).filter(defined1);
      g = g.flatMap(([x, xgroup]) => xgroup.filter(defined1).map(([y, ygroup]) => [x, y, ygroup]));
      return regroup(g, facets);
    },
    x: maybeLabel(first, x),
    y: maybeLabel(second, y),
    [out]: length3
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
function nonempty1([, {length}]) {
  return length > 0;
}

function length2([, group]) {
  return group.length;
}

function length3([,, group]) {
  return group.length;
}

length2.label = length3.label = "Frequency";

// Returns a channel definition that’s the number of elements in the given group
// (length2 above) as a proportion of the total number of elements in the data
// scaled by k. If k is true, it is treated as 100 for percentages; otherwise,
// it is typically 1.
function normalizedLength2(k) {
  let length; // set lazily by the transform
  const value = ([, group]) => group.length * k / length;
  value.normalize = data => void (length = data.length);
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
