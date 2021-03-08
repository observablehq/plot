import {groups} from "d3-array";
import {defined} from "../defined.js";
import {valueof, range, offsetRange, maybeLabel, first, second, identity, maybeTransform} from "../mark.js";

export function groupX({x, ...options} = {}) {
  const [transform, X, y, z, fill, stroke] = group1(x, options);
  return {...options, transform, x: X, y, z, fill, stroke};
}

export function groupY({y, ...options} = {}) {
  const [transform, Y, x, z, fill, stroke] = group1(y, options);
  return {...options, transform, y: Y, x, z, fill, stroke};
}

export function group({x, y, out, ...options} = {}) {
  const [transform, X, Y, L] = group2(x, y, options);
  return {...options, transform, x: X, y: Y, [out]: L};
}

function group1(x = identity, options = {}) {
  const {z, fill, stroke, normalize} = options;
  const k = normalize === true ? 100 : +normalize;
  const [X, setX] = lazyChannel(x);
  const [Y, setY] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  return [
    maybeTransform(options, (data, index) => {
      const X = valueof(data, x);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const B = groups(range(data), i => X[i]);
      const binIndex = [];
      const binData = [];
      const G = Z || F || S;
      const BX = setX([]);
      const BY = setY([]);
      const BZ = Z && setZ([]);
      const BF = F && setF([]);
      const BS = S && setS([]);
      const n = data.length;
      let i = 0;
      for (const facet of index) {
        const binFacet = [];
        for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
          const set = new Set(I);
          for (const [x, b] of B) {
            if (!defined(x)) continue;
            const f = b.filter(i => set.has(i));
            const l = f.length;
            if (l > 0) {
              binFacet.push(i++);
              binData.push(take(data, f));
              BX.push(x);
              BY.push(k ? l * k / n : l);
              if (Z) BZ.push(Z[f[0]]);
              if (F) BF.push(F[f[0]]);
              if (S) BS.push(S[f[0]]);
            }
          }
        }
        binIndex.push(binFacet);
      }
      return {data: binData, index: binIndex};
    }),
    X,
    Y,
    Z,
    F,
    S
  ];
  // const [y, normalizeY] = maybeNormalizeLength2(normalize);
  // return [
  //   maybeTransform(options, (data, index) => {
  //     if (normalizeY) normalizeY(data);
  //     const X = valueof(data, x);
  //     return regroup(
  //       groups(range(data), i => X[i]).filter(defined1),
  //       index,
  //       subset2,
  //       nonempty2
  //     );
  //   }),
  //   maybeLabel(first, x),
  //   y
  // ];
}

function group2(x = first, y = second, options) {
  return [
    maybeTransform(options, (data, index) => {
      const X = valueof(data, x);
      const Y = valueof(data, y);
      return regroup(
        groups(range(data), i => X[i], i => Y[i]).filter(defined1).flatMap(([x, gx]) => gx.filter(defined1).map(([y, gy]) => [x, y, gy])),
        index,
        subset3,
        nonempty3
      );
    }),
    maybeLabel(first, x),
    maybeLabel(second, y),
    length3
  ];
}

// When faceting, subdivides the given groups according to the facet indexes.
// TODO Support a z channel for overlapping groups (that can then be stacked).
function regroup(groups, index, subset, nonempty) {
  const groupIndex = [];
  const groupData = [];
  let k = 0;
  for (const facet of index) {
    const g = groups.map(subset(facet)).filter(nonempty);
    groupIndex.push(offsetRange(g, k));
    k = groupData.push(...g);
  }
  return {data: groupData, index: groupIndex};
}

function subset2(facet) {
  const f = new Set(facet);
  return ([key, group]) => [key, group.filter(i => f.has(i))];
}

function subset3(facet) {
  const f = new Set(facet);
  return ([keyx, keyy, group]) => [keyx, keyy, group.filter(i => f.has(i))];
}

// Since marks don’t render when channel values are undefined (or null or NaN),
// we apply the same logic when grouping. If you want to preserve the group for
// undefined data, map it to an “other” value first.
function defined1([key]) {
  return defined(key);
}

// When faceting, some groups may be empty; these are filtered out.
function nonempty2([, {length}]) {
  return length > 0;
}

function nonempty3([,, {length}]) {
  return length > 0;
}

function length2([, {length}]) {
  return length;
}

function length3([,, {length}]) {
  return length;
}

length2.label = length3.label = "Frequency";

// Returns a channel definition that’s the number of elements in the given group
// (length2 above) as a proportion of the total number of elements in the data
// scaled by k. If k is true, it is treated as 100 for percentages; otherwise,
// it is typically 1.
function maybeNormalizeLength2(normalize) {
  const k = normalize === true ? 100 : +normalize;
  if (!k) return [length2];
  let n; // set lazily by the transform
  const value = ([, {length}]) => length * k / n;
  value.label = `Frequency${k === 100 ? " (%)" : ""}`;
  return [value, ({length}) => void (n = length)];
}
