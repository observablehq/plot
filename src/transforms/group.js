import {group as grouper, sort, InternSet} from "d3";
import {defined, firstof} from "../defined.js";
import {valueof, maybeColor, maybeTransform, maybeValue, maybeLazyChannel, lazyChannel, first, identity, take, maybeTuple} from "../mark.js";

// Group on y, z, fill, or stroke, if any, then group on x.
export function groupX({x, y, out = y == null ? "y" : "fill", ...options} = {}) {
  const [transform, X, l] = group1(x, "y", {y, ...options});
  return {x: X, ...transform, [out]: l};
}

// Group on x, z, fill, or stroke, if any, then group on y.
export function groupY({y, x, out = x == null ? "x" : "fill", ...options} = {}) {
  const [transform, Y, l] = group1(y, "x", {x, ...options});
  return {y: Y, ...transform, [out]: l};
}

// Group on z, fill, or stroke, if any.
export function groupR(options) {
  return group({...options, out: "r"});
}

export function group({x, y, out = "fill", ...options} = {}) {
  const [transform, X, Y, L] = group2(x, y, options);
  return {x: X, y: Y, ...transform, [out]: L};
}

function group1(x = identity, key, {[key]: k, domain, normalize, z, fill, stroke, ...options} = {}) {
  const m = normalize === true || normalize === "z" ? 100 : +normalize;
  const [X, setX] = lazyChannel(x);
  const [L, setL] = lazyChannel(`Frequency${m === 100 ? " (%)" : ""}`);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [BK, setBK] = maybeLazyChannel(k);
  const [BZ, setBZ] = maybeLazyChannel(z);
  const [BF = fill, setBF] = maybeLazyChannel(vfill);
  const [BS = stroke, setBS] = maybeLazyChannel(vstroke);
  const defined = maybeDomain(domain);
  return [
    {
      ...key && {[key]: BK},
      z: BZ,
      fill: BF,
      stroke: BS,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const X = valueof(data, x);
        const K = valueof(data, k);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const groupFacets = [];
        const groupData = [];
        const BX = setX([]);
        const L = setL([]);
        const G = firstof(K, Z, F, S);
        const BK = K && setBK([]);
        const BZ = Z && setBZ([]);
        const BF = F && setBF([]);
        const BS = S && setBS([]);
        let n = data.length;
        let i = 0;
        for (const facet of facets) {
          const groupFacet = [];
          for (const I of G ? grouper(facet, i => G[i]).values() : [facet]) {
            if (normalize === "z") n = I.length;
            for (const [x, f] of sort(grouper(I, i => X[i]), first)) {
              if (!defined(x)) continue;
              const l = f.length;
              groupFacet.push(i++);
              groupData.push(take(data, f));
              BX.push(x);
              L.push(m ? l * m / n : l);
              if (K) BK.push(K[f[0]]);
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
    L
  ];
}

function group2(xv, yv, {z, fill, stroke, domain, normalize, ...options} = {}) {
  let {value: x, domain: xdomain} = {domain, ...maybeValue(xv)};
  let {value: y, domain: ydomain} = {domain, ...maybeValue(yv)};
  ([x, y] = maybeTuple(x, y));
  const k = normalize === true || normalize === "z" ? 100 : +normalize;
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
        let n = data.length;
        let i = 0;
        for (const facet of facets) {
          const groupFacet = [];
          for (const I of G ? grouper(facet, i => G[i]).values() : [facet]) {
            if (normalize === "z") n = I.length;
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
