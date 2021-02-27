import {groups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, maybeValue, range, offsetRange, maybeLabel, first, arrayify, second, identity} from "../mark.js";

export function groupX(data, {x = identity, transform, ...options} = {}) {
  if (transform !== undefined) data = transform(arrayify(data));
  return [
    data,
    {
      ...options,
      transform: group1(x),
      x: maybeLabel(first, x),
      y: maybeLength(data, options)
    }
  ];
}

export function groupY(data, {y = identity, transform, ...options} = {}) {
  if (transform !== undefined) data = transform(arrayify(data));
  return [
    data,
    {
      ...options,
      transform: group1(y),
      y: maybeLabel(first, y),
      x: maybeLength(data, options)
    }
  ];
}

export function group(data, {x = first, y = second, out, transform, ...options} = {}) {
  if (transform !== undefined) data = transform(arrayify(data));
  return [
    data,
    {
      ...options,
      transform: group2(x, y),
      x: maybeLabel(first, x),
      y: maybeLabel(second, y),
      [out]: length3
    }
  ];
}

function group1(x) {
  const {value} = maybeValue({value: x});
  return (data, facets) => {
    const values = valueof(data, value);
    let g = groups(range(data), i => values[i]).filter(defined1);
    return regroup(g, facets);
  };
}

function group2(vx, vy) {
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

function maybeLength(data, {normalize}) {
  return normalize ? normalizer(normalize, data.length) : length2;
}

// An alternative channel definition to length2 (above) that computes the
// proportion of each bin in [0, k]. If k is true, it is treated as 100 for
// percentages; otherwise, it is typically 1.
function normalizer(k, n) {
  k = k === true ? 100 : +k;
  const value = ([, group]) => group.length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return value;
}
