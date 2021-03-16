import {bin as binner, cross, group} from "d3";
import {firstof} from "../defined.js";
import {valueof, first, second, range, identity, lazyChannel, maybeLazyChannel, maybeTransform, maybeColor, maybeValue, mid, take} from "../mark.js";
import {offset} from "../style.js";

// Group on y, z, fill, or stroke, if any, then bin on x.
export function binX({x, y, out = y == null ? "y" : "fill", inset, insetLeft, insetRight, ...options} = {}) {
  ([insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight));
  const [transform, x1, x2, l] = bin1(x, "y", {y, ...options});
  return {x1, x2, ...transform, inset, insetLeft, insetRight, [out]: l};
}

// Group on y, z, fill, or stroke, if any, then bin on x.
export function binXMid({x, out = "r", ...options} = {}) {
  const [transform, x1, x2, l] = bin1(x, "y", options);
  return {x: mid(x1, x2), ...transform, [out]: l};
}

// Group on x, z, fill, or stroke, if any, then bin on y.
export function binY({y, x, out = x == null ? "x" : "fill", inset, insetTop, insetBottom, ...options} = {}) {
  ([insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom));
  const [transform, y1, y2, l] = bin1(y, "x", {x, ...options});
  return {y1, y2, ...transform, inset, insetTop, insetBottom, [out]: l};
}

// Group on y, z, fill, or stroke, if any, then bin on x.
export function binYMid({y, out = "r", ...options} = {}) {
  const [transform, y1, y2, l] = bin1(y, "x", options);
  return {y: mid(y1, y2), ...transform, [out]: l};
}

// Group on z, fill, or stroke, if any, then bin on x and y.
export function binR({x, y, ...options} = {}) {
  const [transform, x1, x2, y1, y2, r] = bin2(x, y, options);
  return {x: mid(x1, x2), y: mid(y1, y2), r, ...transform};
}

// Group on z, fill, or stroke, if any, then bin on x and y.
export function bin({x, y, out = "fill", inset, insetTop, insetRight, insetBottom, insetLeft, ...options} = {}) {
  ([insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom));
  ([insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight));
  const [transform, x1, x2, y1, y2, l] = bin2(x, y, options);
  return {x1, x2, y1, y2, ...transform, inset, insetTop, insetRight, insetBottom, insetLeft, [out]: l};
}

function bin1(x, key, {[key]: k, z, fill, stroke, domain, thresholds, normalize, cumulative, ...options} = {}) {
  const m = normalize === true || normalize === "z" ? 100 : +normalize;
  const bin = binof(identity, {value: x, domain, thresholds});
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [L, setL] = lazyChannel(`Frequency${m === 100 ? " (%)" : ""}`);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [BK, setBK] = maybeLazyChannel(k);
  const [BZ, setBZ] = maybeLazyChannel(z);
  const [BF = fill, setBF] = maybeLazyChannel(vfill);
  const [BS = stroke, setBS] = maybeLazyChannel(vstroke);
  return [
    {
      ...key && {[key]: BK},
      z: BZ,
      fill: BF,
      stroke: BS,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const B = bin(data);
        const K = valueof(data, k);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const binFacets = [];
        const binData = [];
        const X1 = setX1([]);
        const X2 = setX2([]);
        const L = setL([]);
        const G = firstof(K, Z, F, S);
        const BK = K && setBK([]);
        const BZ = Z && setBZ([]);
        const BF = F && setBF([]);
        const BS = S && setBS([]);
        let n = data.length;
        let i = 0;
        if (cumulative < 0) B.reverse();
        for (const facet of facets) {
          const binFacet = [];
          for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
            if (normalize === "z") n = I.length;
            const set = new Set(I);
            let f;
            for (const b of B) {
              const s = b.filter(i => set.has(i));
              f = cumulative && f !== undefined ? f.concat(s) : s;
              const l = f.length;
              if (l > 0) {
                binFacet.push(i++);
                binData.push(take(data, f));
                X1.push(b.x0);
                X2.push(b.x1);
                L.push(m ? l * m / n : l);
                if (K) BK.push(K[f[0]]);
                if (Z) BZ.push(Z[f[0]]);
                if (F) BF.push(F[f[0]]);
                if (S) BS.push(S[f[0]]);
              }
            }
          }
          binFacets.push(binFacet);
        }
        return {data: binData, facets: binFacets};
      })
    },
    X1,
    X2,
    L
  ];
}

// Here x and y may each either be a standalone value (e.g., a string
// representing a field name, a function, an array), or the value and some
// additional per-dimension binning options as an objects of the form {value,
// domain?, thresholds?}.
function bin2(x, y, {domain, thresholds, normalize, z, fill, stroke, ...options} = {}) {
  const m = normalize === true || normalize === "z" ? 100 : +normalize;
  const binX = binof(first, {domain, thresholds, ...maybeValue(x)});
  const binY = binof(second, {domain, thresholds, ...maybeValue(y)});
  const bin = data => cross(binX(data).filter(nonempty), binY(data).filter(nonempty).map(binset2), (x, y) => y(x));
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  const [L, setL] = lazyChannel(`Frequency${m === 100 ? " (%)" : ""}`);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [BZ, setBZ] = maybeLazyChannel(z);
  const [BF = fill, setBF] = maybeLazyChannel(vfill);
  const [BS = stroke, setBS] = maybeLazyChannel(vstroke);
  return [
    {
      z: BZ,
      fill: BF,
      stroke: BS,
      ...options,
      transform: maybeTransform(options, (data, facets) => {
        const B = bin(data);
        const Z = valueof(data, z);
        const F = valueof(data, vfill);
        const S = valueof(data, vstroke);
        const binFacets = [];
        const binData = [];
        const X1 = setX1([]);
        const X2 = setX2([]);
        const Y1 = setY1([]);
        const Y2 = setY2([]);
        const L = setL([]);
        const G = firstof(Z, F, S);
        const BZ = Z && setBZ([]);
        const BF = F && setBF([]);
        const BS = S && setBS([]);
        let n = data.length;
        let i = 0;
        for (const facet of facets) {
          const binFacet = [];
          for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
            if (normalize === "z") n = I.length;
            const set = new Set(I);
            for (const b of B) {
              const f = b.filter(i => set.has(i));
              const l = f.length;
              if (l > 0) {
                binFacet.push(i++);
                binData.push(take(data, f));
                X1.push(b.x0);
                X2.push(b.x1);
                Y1.push(b.y0);
                Y2.push(b.y1);
                L.push(m ? l * m / n : l);
                if (Z) BZ.push(Z[f[0]]);
                if (F) BF.push(F[f[0]]);
                if (S) BS.push(S[f[0]]);
              }
            }
          }
          binFacets.push(binFacet);
        }
        return {data: binData, facets: binFacets};
      })
    },
    X1,
    X2,
    Y1,
    Y2,
    L
  ];
}

function binof(defaultValue, {value = defaultValue, domain, thresholds}) {
  return data => {
    const values = valueof(data, value);
    const bin = binner().value(i => values[i]);
    if (domain !== undefined) bin.domain(domain);
    if (thresholds !== undefined) bin.thresholds(thresholds);
    return bin(range(data));
  };
}

function binset2(biny) {
  const y = new Set(biny);
  const {x0: y0, x1: y1} = biny;
  return binx => {
    const subbin = binx.filter(i => y.has(i));
    subbin.x0 = binx.x0;
    subbin.x1 = binx.x1;
    subbin.y0 = y0;
    subbin.y1 = y1;
    return subbin;
  };
}

function nonempty({length}) {
  return length > 0;
}

function length1({length}) {
  return length;
}

length1.label = "Frequency";

function maybeInset(inset, inset1, inset2) {
  return inset === undefined && inset1 === undefined && inset2 === undefined
    ? (offset ? [1, 0] : [0.5, 0.5])
    : [inset1, inset2];
}
