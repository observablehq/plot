import {bin as binner, cross, group} from "d3";
import {valueof, first, second, range, identity, lazyChannel, maybeLazyChannel, maybeTransform, maybeColor, maybeValue, mid, take} from "../mark.js";

export function binX({x, insetLeft = 1, ...options} = {}) {
  const [transform, x1, x2, y, z, fill, stroke] = bin1(x, options);
  return {y, x1, x2, ...transform, z, fill, stroke, insetLeft};
}

export function binY({y, insetTop = 1, ...options} = {}) {
  const [transform, y1, y2, x, z, fill, stroke] = bin1(y, options);
  return {x, y1, y2, ...transform, z, fill, stroke, insetTop};
}

export function binR({x, y, ...options} = {}) {
  const [transform, x1, x2, y1, y2, r, z, fill, stroke] = bin2(x, y, options);
  return {x: mid(x1, x2), y: mid(y1, y2), r, ...transform, z, fill, stroke};
}

export function binFill(options) {
  return bin({...options, out: "fill"});
}

export function bin({x, y, insetLeft = 1, insetTop = 1, out, ...options} = {}) {
  const [transform, x1, x2, y1, y2, l, z, fill, stroke] = bin2(x, y, options);
  return {x1, x2, y1, y2, ...transform, z, fill, stroke, insetLeft, insetTop, [out]: l};
}

function bin1(x, {domain, thresholds, normalize, cumulative, ...options} = {}) {
  const {z, fill, stroke} = options;
  const k = normalize === true ? 100 : +normalize;
  const bin = binof(identity, {value: x, domain, thresholds});
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [Y, setY] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  return [
    {
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
        const Y = setY([]);
        const G = Z || F || S;
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        if (cumulative < 0) B.reverse();
        for (const facet of facets) {
          const binFacet = [];
          for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
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
                Y.push(k ? l * k / n : l);
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
    Y,
    Z,
    F,
    S
  ];
}

// Here x and y may each either be a standalone value (e.g., a string
// representing a field name, a function, an array), or the value and some
// additional per-dimension binning options as an objects of the form {value,
// domain?, thresholds?}.
function bin2(x, y, {domain, thresholds, normalize, ...options} = {}) {
  const {z, fill, stroke} = options;
  const k = normalize === true ? 100 : +normalize;
  const binX = binof(first, {domain, thresholds, ...maybeValue(x)});
  const binY = binof(second, {domain, thresholds, ...maybeValue(y)});
  const bin = data => cross(binX(data).filter(nonempty), binY(data).filter(nonempty).map(binset2), (x, y) => y(x));
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [Y1, setY1] = lazyChannel(y);
  const [Y2, setY2] = lazyChannel(y);
  const [L, setL] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  return [
    {
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
        const G = Z || F || S;
        const BZ = Z && setZ([]);
        const BF = F && setF([]);
        const BS = S && setS([]);
        const n = data.length;
        let i = 0;
        for (const facet of facets) {
          const binFacet = [];
          for (const I of G ? group(facet, i => G[i]).values() : [facet]) {
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
                L.push(k ? l * k / n : l);
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
    L,
    Z,
    F,
    S
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
