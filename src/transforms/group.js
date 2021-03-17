import {group as grouper, sort, InternSet} from "d3";
import {defined, firstof} from "../defined.js";
import {valueof, maybeColor, maybeTransform, maybeValue, maybeLazyChannel, lazyChannel, first, identity, take, maybeTuple} from "../mark.js";

export function groupX({x, ...options} = {}) {
  const [transform, X, y] = group1(x, options);
  return {x: X, y, ...transform};
}

export function groupY({y, ...options} = {}) {
  const [transform, Y, x] = group1(y, options);
  return {y: Y, x, ...transform};
}

export function groupR(options) {
  return group({...options, out: "r"});
}

export function group({x, y, out = "fill", ...options} = {}) {
  const [transform, X, Y, L] = group2(x, y, options);
  return {x: X, y: Y, ...transform, [out]: L};
}

function group1(x = identity, {domain, normalize, z, fill, stroke, ...options} = {}) {
  const k = normalize === true ? 100 : +normalize;
  const [X, setX] = lazyChannel(x);
  const [Y, setY] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  const defined = maybeDomain(domain);
  return [
    {
      z: Z,
      fill: F,
      stroke: S,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const X = valueof(data, x);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const groupFacets = [];
        const groupData = [];
        const G = firstof(Z, F, S);
        const BX = setX([]);
        const BY = setY([]);
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        for (const facet of facets) {
          const groupFacet = [];
          for (const I of G ? grouper(facet, i => G[i]).values() : [facet]) {
            for (const [x, f] of sort(grouper(I, i => X[i]), first)) {
              if (!defined(x)) continue;
              const l = f.length;
              groupFacet.push(i++);
              groupData.push(take(data, f));
              BX.push(x);
              BY.push(k ? l * k / n : l);
              if (Z) BZ.push(Z[f[0]]);
              if (F) BF.push(F[f[0]]);
              if (S) BS.push(S[f[0]]);
            }
          }
          groupFacets.push(groupFacet);
        }
        return {data: groupData, facets: groupFacets};
      })
    },
    X,
    Y
  ];
}

function group2(xv, yv, {z, fill, stroke, domain, normalize, ...options} = {}) {
  let {value: x, domain: xdomain} = {domain, ...maybeValue(xv)};
  let {value: y, domain: ydomain} = {domain, ...maybeValue(yv)};
  ([x, y] = maybeTuple(x, y));
  const k = normalize === true ? 100 : +normalize;
  const [X, setX] = lazyChannel(x);
  const [Y, setY] = lazyChannel(y);
  const [L, setL] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  const xdefined = maybeDomain(xdomain);
  const ydefined = maybeDomain(ydomain);
  return [
    {
      z: Z,
      fill: F,
      stroke: S,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const X = valueof(data, x);
        const Y = valueof(data, y);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const groupFacets = [];
        const groupData = [];
        const G = firstof(Z, F, S);
        const BX = setX([]);
        const BY = setY([]);
        const BL = setL([]);
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        for (const facet of facets) {
          const groupFacet = [];
          for (const I of G ? grouper(facet, i => G[i]).values() : [facet]) {
            for (const [y, fy] of sort(grouper(I, i => Y[i]), first)) {
              if (!ydefined(y)) continue;
              for (const [x, f] of sort(grouper(fy, i => X[i]), first)) {
                if (!xdefined(x)) continue;
                const l = f.length;
                groupFacet.push(i++);
                groupData.push(take(data, f));
                BX.push(x);
                BY.push(y);
                BL.push(k ? l * k / n : l);
                if (Z) BZ.push(Z[f[0]]);
                if (F) BF.push(F[f[0]]);
                if (S) BS.push(S[f[0]]);
              }
            }
          }
          groupFacets.push(groupFacet);
        }
        return {data: groupData, facets: groupFacets};
      })
    },
    X,
    Y,
    L
  ];
}

function maybeDomain(domain) {
  if (domain === undefined) return defined;
  if (domain === null) return () => false;
  domain = new InternSet(domain);
  return value => domain.has(value);
}
