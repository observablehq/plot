import {bin as binner, cross, group} from "d3-array";
import {valueof, first, second, range, identity, maybeLabel, maybeTransform, lazyChannel, maybeLazyChannel, maybeColor, take} from "../mark.js";

export function binX({x, insetLeft = 1, ...options} = {}) {
  const [transform, x1, x2, y, z, fill, stroke] = bin1(x, options);
  return {...options, transform, y, x1, x2, z, fill, stroke, insetLeft};
}

export function binY({y, insetTop = 1, ...options} = {}) {
  const [transform, y1, y2, x, z, fill, stroke] = bin1(y, options);
  return {...options, transform, x, y1, y2, z, fill, stroke, insetTop};
}

export function binR({x, y, ...options} = {}) {
  const {transform, xMid, yMid, L: r, Z: z, F: fill, S: stroke} = bin2(x, y, options);
  return {...options, transform, x: xMid, y: yMid, r, z, fill, stroke};
}

export function bin({x, y, insetLeft = 1, insetTop = 1, out, ...options} = {}) {
  const {transform, L: l, Z: z, F: fill, S: stroke, X1, X2, Y1, Y2} = bin2(x, y, options);
  return {...options, transform, x1: X1, x2: X2, y1: Y1, y2: Y2, z, fill, stroke, insetLeft, insetTop, [out]: l};
}

function bin1(x = identity, options = {}) {
  const {z, fill, stroke, domain, thresholds, normalize, cumulative} = options;
  const k = normalize === true ? 100 : +normalize;
  const bin = binof({value: x, domain, thresholds});
  const [X1, setX1] = lazyChannel(x);
  const [X2, setX2] = lazyChannel(x);
  const [Y, setY] = lazyChannel(`Frequency${k === 100 ? " (%)" : ""}`);
  const [Z, setZ] = maybeLazyChannel(z);
  const [vfill] = maybeColor(fill);
  const [vstroke] = maybeColor(stroke);
  const [F = fill, setF] = maybeLazyChannel(vfill);
  const [S = stroke, setS] = maybeLazyChannel(vstroke);
  return [
    maybeTransform(options, (data, index) => {
      const B = bin(data);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const binIndex = [];
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
      for (const facet of index) {
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
        binIndex.push(binFacet);
      }
      return {data: binData, index: binIndex};
    }),
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
function bin2(x, y, options = {}) {
  const {z, fill, stroke, domain, thresholds, thresholds_x = thresholds, thresholds_y = thresholds, normalize} = options;
  const k = normalize === true ? 100 : +normalize;
  const binX = binof({domain, thresholds: thresholds_x, value: first, ...maybeValue(x)});
  const binY = binof({domain, thresholds: thresholds_y, value: second, ...maybeValue(y)});
  const bin = data => cross(
    binX(data).filter(nonempty),
    binY(data).filter(nonempty).map(binset2),
    (x, y) => y(x)
  );
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

  return {
    transform: maybeTransform(options, (data, index) => {
      const B = bin(data);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const binIndex = [];
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
      for (const facet of index) {
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
        binIndex.push(binFacet);
      }
      return {data: binData, index: binIndex};
    }),
    X1,
    X2,
    Y1,
    Y2,
    xMid: {
      transform: () => {
        const XX1 = X1.transform();
        const XX2 = X2.transform();
        return Array.from(XX1, (x1, i) => (x1 + XX2[i]) / 2);
      },
      label: maybeLabel(x, x).label
    },
    yMid: {
      transform: () => {
        const YY1 = Y1.transform();
        const YY2 = Y2.transform();
        return Array.from(YY1, (y1, i) => (y1 + YY2[i]) / 2);
      },
      label: maybeLabel(y, y).label
    },
    L,
    Z,
    F,
    S
  };
}

function binof({value, domain, thresholds}) {
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

// This distinguishes between per-dimension options and a standalone value.
function maybeValue(value) {
  return typeof value === "object" && value && "value" in value ? value : {value};
}
