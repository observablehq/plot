import {group as grouper, sort, sum, InternSet} from "d3";
import {defined, firstof} from "../defined.js";
import {valueof, maybeColor, maybeTransform, maybeValue, maybeLazyChannel, lazyChannel, first, identity, take, maybeTuple, labelof} from "../mark.js";

// Group on {z, fill, stroke}.
export function groupZ({out = "fill", ...options} = {}) {
  const [transform, L] = group2(null, null, options);
  return {...transform, [out]: L};
}

export function groupZX(options) {
  return groupZ({...options, out: "x"});
}

export function groupZY(options) {
  return groupZ({...options, out: "y"});
}

export function groupZR(options) {
  return groupZ({...options, out: "r"});
}

// Group on {z, fill, stroke}, then on x (optionally).
export function groupX({x = identity, out = "y", ...options} = {}) {
  const [transform, L, X] = group2(x, null, options);
  return {...transform, x: X, [out]: L};
}

// Group on {z, fill, stroke}, then on y (optionally).
export function groupY({y = identity, out = "x", ...options} = {}) {
  const [transform, L,, Y] = group2(null, y, options);
  return {...transform, y: Y, [out]: L};
}

// Group on {z, fill, stroke}, then on x and y (optionally).
export function group({x, y, out = "fill", ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  const [transform, L, X, Y] = group2(x, y, options);
  return {...transform, x: X, y: Y, [out]: L};
}

export function groupR(options) {
  return group({...options, out: "r"});
}

function group2(xv, yv, {z, fill, stroke, weight, domain, normalize, ...options} = {}) {
  let {value: x, domain: xdomain} = {domain, ...maybeValue(xv)};
  let {value: y, domain: ydomain} = {domain, ...maybeValue(yv)};
  ([x, y] = maybeTuple(x, y));
  const m = maybeNormalize(normalize);
  const [BL, setBL] = lazyChannel(`${labelof(weight, "Frequency")}${m === 100 ? " (%)" : ""}`);
  const [BX, setBX] = maybeLazyChannel(x);
  const [BY, setBY] = maybeLazyChannel(y);
  const [BZ, setBZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [BF = fill, setBF] = maybeLazyChannel(vfill);
  const [BS = stroke, setBS] = maybeLazyChannel(vstroke);
  const xdefined = BX && maybeDomain(xdomain);
  const ydefined = BY && maybeDomain(ydomain);
  return [
    {
      z: BZ,
      fill: BF,
      stroke: BS,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const X = valueof(data, x);
        const Y = valueof(data, y);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const W = valueof(data, weight);
        const groupFacets = [];
        const groupData = [];
        const G = firstof(Z, F, S);
        const BL = setBL([]);
        const BX = X && setBX([]);
        const BY = Y && setBY([]);
        const BZ = Z && setBZ([]);
        const BF = F && setBF([]);
        const BS = S && setBS([]);
        let n = W ? sum(W) : data.length;
        let i = 0;
        for (const facet of facets) {
          const groupFacet = [];
          if (normalize === "facet") n = W ? sum(facet, i => W[i]) : facet.length;
          for (const I of G ? grouper(facet, i => G[i]).values() : [facet]) {
            if (normalize === "z") n = W ? sum(I, i => W[i]) : I.length;
            for (const [y, fy] of Y ? sort(grouper(I, i => Y[i]), first).filter(ydefined) : [[, I]]) {
              for (const [x, f] of X ? sort(grouper(fy, i => X[i]), first).filter(xdefined) : [[, fy]]) {
                const l = W ? sum(f, i => W[i]) : f.length;
                groupFacet.push(i++);
                groupData.push(take(data, f));
                BL.push(m ? l * m / n : l);
                if (X) BX.push(x);
                if (Y) BY.push(y);
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
    BL,
    BX,
    BY
  ];
}

function maybeDomain(domain) {
  if (domain === undefined) return defined1;
  if (domain === null) return () => false;
  domain = new InternSet(domain);
  return ([key]) => domain.has(key);
}

function defined1([key]) {
  return defined(key);
}

function maybeNormalize(normalize) {
  if (!normalize) return;
  if (normalize === true) return 100;
  if (typeof normalize === "number") return normalize;
  switch ((normalize + "").toLowerCase()) {
    case "facet": case "z": return 100;
  }
  throw new Error("invalid normalize");
}
