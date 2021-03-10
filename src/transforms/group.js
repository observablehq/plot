import {group as grouper, sort, InternSet} from "d3";
import {defined} from "../defined.js";
import {valueof, maybeColor, maybeTransform, maybeValue, maybeLazyChannel, lazyChannel, first, second, identity, take} from "../mark.js";

export function groupX({x, ...options} = {}) {
  const [transform, X, y, z, fill, stroke] = group1(x, options);
  return {x: X, y, ...transform, z, fill, stroke};
}

export function groupY({y, ...options} = {}) {
  const [transform, Y, x, z, fill, stroke] = group1(y, options);
  return {y: Y, x, ...transform, z, fill, stroke};
}

export function groupR(options) {
  return group({...options, out: "r"});
}

export function groupFill(options) {
  return group({...options, out: "fill"});
}

export function group({x, y, out, ...options} = {}) {
  const [transform, X, Y, L, z, fill, stroke] = group2(x, y, options);
  return {x: X, y: Y, ...transform, z, fill, stroke, [out]: L};
}

function group1(x = identity, {domain, normalize, ...options} = {}) {
  const {z, fill, stroke} = options;
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
      ...options,
      transform: maybeTransform(options, (data, index) => {
        const X = valueof(data, x);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const groupIndex = [];
        const groupData = [];
        const G = Z || F || S;
        const BX = setX([]);
        const BY = setY([]);
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        for (const facet of index) {
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
          groupIndex.push(groupFacet);
        }
        return {data: groupData, index: groupIndex};
      })
    },
    X,
    Y,
    Z,
    F,
    S
  ];
}

function group2(xv, yv, {domain, normalize, ...options} = {}) {
  const {z, fill, stroke} = options;
  const {value: x = first, domain: xdomain} = {domain, ...maybeValue(xv)};
  const {value: y = second, domain: ydomain} = {domain, ...maybeValue(yv)};
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
      ...options,
      transform: maybeTransform(options, (data, index) => {
        const X = valueof(data, x);
        const Y = valueof(data, y);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const groupIndex = [];
        const groupData = [];
        const G = Z || F || S;
        const BX = setX([]);
        const BY = setY([]);
        const BL = setL([]);
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        for (const facet of index) {
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
          groupIndex.push(groupFacet);
        }
        return {data: groupData, index: groupIndex};
      })
    },
    X,
    Y,
    L,
    Z,
    F,
    S
  ];
}

function maybeDomain(domain) {
  if (domain === undefined) return defined;
  if (domain === null) return () => false;
  domain = new InternSet(domain);
  return value => domain.has(value);
}
