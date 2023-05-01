import {
  bisect,
  extent,
  thresholdFreedmanDiaconis,
  thresholdScott,
  thresholdSturges,
  ticks,
  tickIncrement,
  utcTickInterval
} from "d3";
import {
  valueof,
  identity,
  coerceDate,
  coerceNumbers,
  maybeColumn,
  maybeRangeInterval,
  maybeTuple,
  maybeColorChannel,
  maybeValue,
  mid,
  labelof,
  isTemporal,
  isIterable,
  map
} from "../options.js";
import {maybeUtcInterval} from "../time.js";
import {basic} from "./basic.js";
import {
  hasOutput,
  maybeEvaluator,
  maybeGroup,
  maybeOutput,
  maybeOutputs,
  maybeReduce,
  maybeSort,
  maybeSubgroup,
  reduceCount,
  reduceFirst,
  reduceIdentity
} from "./group.js";
import {maybeInsetX, maybeInsetY} from "./inset.js";
import {maybeApplyInterval} from "../options.js";

export function binX(outputs = {y: "count"}, options = {}) {
  // Group on {z, fill, stroke}, then optionally on y, then bin x.
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = options;
  return binn(maybeBinValue(x, options, identity), null, null, y, outputs, maybeInsetX(options));
}

export function binY(outputs = {x: "count"}, options = {}) {
  // Group on {z, fill, stroke}, then optionally on x, then bin y.
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = options;
  return binn(null, maybeBinValue(y, options, identity), x, null, outputs, maybeInsetY(options));
}

export function bin(outputs = {fill: "count"}, options = {}) {
  // Group on {z, fill, stroke}, then bin on x and y.
  [outputs, options] = mergeOptions(outputs, options);
  const {x, y} = maybeBinValueTuple(options);
  return binn(x, y, null, null, outputs, maybeInsetX(maybeInsetY(options)));
}

function maybeDenseInterval(bin, k, options = {}) {
  return options?.interval == null
    ? options
    : bin({[k]: options?.reduce === undefined ? reduceFirst : options.reduce, filter: null}, options);
}

export function maybeDenseIntervalX(options) {
  return maybeDenseInterval(binX, "y", options);
}

export function maybeDenseIntervalY(options) {
  return maybeDenseInterval(binY, "x", options);
}

function binn(
  bx, // optionally bin on x (exclusive with gx)
  by, // optionally bin on y (exclusive with gy)
  gx, // optionally group on x (exclusive with bx and gy)
  gy, // optionally group on y (exclusive with by and gx)
  {
    data: reduceData = reduceIdentity, // TODO avoid materializing when unused?
    filter = reduceCount, // return only non-empty bins by default
    sort,
    reverse,
    ...outputs // output channel definitions
  } = {},
  inputs = {} // input channels and options
) {
  bx = maybeBin(bx);
  by = maybeBin(by);

  // Compute the outputs.
  outputs = maybeBinOutputs(outputs, inputs);
  reduceData = maybeBinReduce(reduceData, identity);
  sort = sort == null ? undefined : maybeBinOutput("sort", sort, inputs);
  filter = filter == null ? undefined : maybeBinEvaluator("filter", filter, inputs);

  // Don’t group on a channel if an output requires it as an input!
  if (gx != null && hasOutput(outputs, "x", "x1", "x2")) gx = null;
  if (gy != null && hasOutput(outputs, "y", "y1", "y2")) gy = null;

  // Produce x1, x2, y1, and y2 output channels as appropriate (when binning).
  const [BX1, setBX1] = maybeColumn(bx);
  const [BX2, setBX2] = maybeColumn(bx);
  const [BY1, setBY1] = maybeColumn(by);
  const [BY2, setBY2] = maybeColumn(by);

  // Produce x or y output channels as appropriate (when grouping).
  const [k, gk] = gx != null ? [gx, "x"] : gy != null ? [gy, "y"] : [];
  const [GK, setGK] = maybeColumn(k);

  // Greedily materialize the z, fill, and stroke channels (if channels and not
  // constants) so that we can reference them for subdividing groups without
  // computing them more than once. We also want to consume options that should
  // only apply to this transform rather than passing them through to the next.
  const {
    x,
    y,
    z,
    fill,
    stroke,
    x1,
    x2, // consumed if x is an output
    y1,
    y2, // consumed if y is an output
    domain,
    cumulative,
    thresholds,
    interval,
    ...options
  } = inputs;
  const [GZ, setGZ] = maybeColumn(z);
  const [vfill] = maybeColorChannel(fill);
  const [vstroke] = maybeColorChannel(stroke);
  const [GF, setGF] = maybeColumn(vfill);
  const [GS, setGS] = maybeColumn(vstroke);

  return {
    ...("z" in inputs && {z: GZ || z}),
    ...("fill" in inputs && {fill: GF || fill}),
    ...("stroke" in inputs && {stroke: GS || stroke}),
    ...basic(options, (data, facets, plotOptions) => {
      const K = maybeApplyInterval(valueof(data, k), plotOptions?.[gk]);
      const Z = valueof(data, z);
      const F = valueof(data, vfill);
      const S = valueof(data, vstroke);
      const G = maybeSubgroup(outputs, {z: Z, fill: F, stroke: S});
      const groupFacets = [];
      const groupData = [];
      const GK = K && setGK([]);
      const GZ = Z && setGZ([]);
      const GF = F && setGF([]);
      const GS = S && setGS([]);
      const BX1 = bx && setBX1([]);
      const BX2 = bx && setBX2([]);
      const BY1 = by && setBY1([]);
      const BY2 = by && setBY2([]);
      const bin = bing(bx?.(data), by?.(data));
      let i = 0;
      for (const o of outputs) o.initialize(data);
      if (sort) sort.initialize(data);
      if (filter) filter.initialize(data);
      for (const facet of facets) {
        const groupFacet = [];
        for (const o of outputs) o.scope("facet", facet);
        if (sort) sort.scope("facet", facet);
        if (filter) filter.scope("facet", facet);
        for (const [f, I] of maybeGroup(facet, G)) {
          for (const [k, g] of maybeGroup(I, K)) {
            for (const [b, extent] of bin(g)) {
              if (filter && !filter.reduce(b, extent)) continue;
              groupFacet.push(i++);
              groupData.push(reduceData.reduceIndex(b, data, extent));
              if (K) GK.push(k);
              if (Z) GZ.push(G === Z ? f : Z[b[0]]);
              if (F) GF.push(G === F ? f : F[b[0]]);
              if (S) GS.push(G === S ? f : S[b[0]]);
              if (BX1) BX1.push(extent.x1), BX2.push(extent.x2);
              if (BY1) BY1.push(extent.y1), BY2.push(extent.y2);
              for (const o of outputs) o.reduce(b, extent);
              if (sort) sort.reduce(b);
            }
          }
        }
        groupFacets.push(groupFacet);
      }
      maybeSort(groupFacets, sort, reverse);
      return {data: groupData, facets: groupFacets};
    }),
    ...(!hasOutput(outputs, "x") && (BX1 ? {x1: BX1, x2: BX2, x: mid(BX1, BX2)} : {x, x1, x2})),
    ...(!hasOutput(outputs, "y") && (BY1 ? {y1: BY1, y2: BY2, y: mid(BY1, BY2)} : {y, y1, y2})),
    ...(GK && {[gk]: GK}),
    ...Object.fromEntries(outputs.map(({name, output}) => [name, output]))
  };
}

// Allow bin options to be specified as part of outputs; merge them into options.
function mergeOptions({cumulative, domain, thresholds, interval, ...outputs}, options) {
  return [outputs, {cumulative, domain, thresholds, interval, ...options}];
}

function maybeBinValue(value, {cumulative, domain, thresholds, interval}, defaultValue) {
  value = {...maybeValue(value)};
  if (value.domain === undefined) value.domain = domain;
  if (value.cumulative === undefined) value.cumulative = cumulative;
  if (value.thresholds === undefined) value.thresholds = thresholds;
  if (value.interval === undefined) value.interval = interval;
  if (value.value === undefined) value.value = defaultValue;
  value.thresholds = maybeThresholds(value.thresholds, value.interval);
  return value;
}

function maybeBinValueTuple(options) {
  let {x, y} = options;
  x = maybeBinValue(x, options);
  y = maybeBinValue(y, options);
  [x.value, y.value] = maybeTuple(x.value, y.value);
  return {x, y};
}

function maybeBin(options) {
  if (options == null) return;
  const {value, cumulative, domain = extent, thresholds} = options;
  const bin = (data) => {
    let V = valueof(data, value);
    let T; // bin thresholds
    if (isTemporal(V) || isTimeThresholds(thresholds)) {
      V = map(V, coerceDate, Float64Array); // like coerceDates, but faster
      let [min, max] = typeof domain === "function" ? domain(V) : domain;
      let t = typeof thresholds === "function" && !isInterval(thresholds) ? thresholds(V, min, max) : thresholds;
      if (typeof t === "number") t = utcTickInterval(min, max, t);
      if (isInterval(t)) {
        if (domain === extent) {
          min = t.floor(min);
          max = t.offset(t.floor(max));
        }
        t = t.range(min, t.offset(max));
      }
      T = t;
    } else {
      V = coerceNumbers(V);
      let [min, max] = typeof domain === "function" ? domain(V) : domain;
      let t = typeof thresholds === "function" && !isInterval(thresholds) ? thresholds(V, min, max) : thresholds;
      if (typeof t === "number") {
        // This differs from d3.ticks with regard to exclusive bounds: we want a
        // first threshold less than or equal to the minimum, and a last
        // threshold (strictly) greater than the maximum.
        if (domain === extent) {
          let step = tickIncrement(min, max, t);
          if (isFinite(step)) {
            if (step > 0) {
              let r0 = Math.round(min / step);
              let r1 = Math.round(max / step);
              if (!(r0 * step <= min)) --r0;
              if (!(r1 * step > max)) ++r1;
              let n = r1 - r0 + 1;
              t = new Float64Array(n);
              for (let i = 0; i < n; ++i) t[i] = (r0 + i) * step;
            } else if (step < 0) {
              step = -step;
              let r0 = Math.round(min * step);
              let r1 = Math.round(max * step);
              if (!(r0 / step <= min)) --r0;
              if (!(r1 / step > max)) ++r1;
              let n = r1 - r0 + 1;
              t = new Float64Array(n);
              for (let i = 0; i < n; ++i) t[i] = (r0 + i) / step;
            } else {
              t = [min];
            }
          } else {
            t = [min];
          }
        } else {
          t = ticks(min, max, t);
        }
      } else if (isInterval(t)) {
        if (domain === extent) {
          min = t.floor(min);
          max = t.offset(t.floor(max));
        }
        t = t.range(min, t.offset(max));
      }
      T = t;
    }
    const E = [];
    if (T.length === 1) E.push([T[0], T[0]]); // collapsed domain
    else for (let i = 1; i < T.length; ++i) E.push([T[i - 1], T[i]]);
    E.bin = (cumulative < 0 ? bin1cn : cumulative > 0 ? bin1cp : bin1)(E, T, V);
    return E;
  };
  bin.label = labelof(value);
  return bin;
}

export function maybeThresholds(thresholds, interval, defaultThresholds = thresholdAuto) {
  if (thresholds === undefined) {
    return interval === undefined ? defaultThresholds : maybeRangeInterval(interval);
  }
  if (typeof thresholds === "string") {
    switch (thresholds.toLowerCase()) {
      case "freedman-diaconis":
        return thresholdFreedmanDiaconis;
      case "scott":
        return thresholdScott;
      case "sturges":
        return thresholdSturges;
      case "auto":
        return thresholdAuto;
    }
    return maybeUtcInterval(thresholds);
  }
  return thresholds; // pass array, count, or function to bin.thresholds
}

function maybeBinOutputs(outputs, inputs) {
  return maybeOutputs(outputs, inputs, maybeBinOutput);
}

function maybeBinOutput(name, reduce, inputs) {
  return maybeOutput(name, reduce, inputs, maybeBinEvaluator);
}

function maybeBinEvaluator(name, reduce, inputs) {
  return maybeEvaluator(name, reduce, inputs, maybeBinReduce);
}

function maybeBinReduce(reduce, value) {
  return maybeReduce(reduce, value, maybeBinReduceFallback);
}

function maybeBinReduceFallback(reduce) {
  switch (`${reduce}`.toLowerCase()) {
    case "x":
      return reduceX;
    case "x1":
      return reduceX1;
    case "x2":
      return reduceX2;
    case "y":
      return reduceY;
    case "y1":
      return reduceY1;
    case "y2":
      return reduceY2;
  }
  throw new Error(`invalid bin reduce: ${reduce}`);
}

function thresholdAuto(values, min, max) {
  return Math.min(200, thresholdScott(values, min, max));
}

function isTimeThresholds(t) {
  return isTimeInterval(t) || (isIterable(t) && isTemporal(t));
}

function isTimeInterval(t) {
  return isInterval(t) && typeof t === "function" && t() instanceof Date;
}

function isInterval(t) {
  return typeof t?.range === "function";
}

function bing(EX, EY) {
  return EX && EY
    ? function* (I) {
        const X = EX.bin(I); // first bin on x
        for (const [ix, [x1, x2]] of EX.entries()) {
          const Y = EY.bin(X[ix]); // then bin on y
          for (const [iy, [y1, y2]] of EY.entries()) {
            yield [Y[iy], {x1, y1, x2, y2}];
          }
        }
      }
    : EX
    ? function* (I) {
        const X = EX.bin(I);
        for (const [i, [x1, x2]] of EX.entries()) {
          yield [X[i], {x1, x2}];
        }
      }
    : function* (I) {
        const Y = EY.bin(I);
        for (const [i, [y1, y2]] of EY.entries()) {
          yield [Y[i], {y1, y2}];
        }
      };
}

// non-cumulative distribution
function bin1(E, T, V) {
  T = coerceNumbers(T); // for faster bisection
  return (I) => {
    const B = E.map(() => []);
    for (const i of I) B[bisect(T, V[i]) - 1]?.push(i); // TODO quantization?
    return B;
  };
}

// cumulative distribution
function bin1cp(E, T, V) {
  const bin = bin1(E, T, V);
  return (I) => {
    const B = bin(I);
    for (let i = 1, n = B.length; i < n; ++i) {
      const C = B[i - 1];
      const b = B[i];
      for (const j of C) b.push(j);
    }
    return B;
  };
}

// complementary cumulative distribution
function bin1cn(E, T, V) {
  const bin = bin1(E, T, V);
  return (I) => {
    const B = bin(I);
    for (let i = B.length - 2; i >= 0; --i) {
      const C = B[i + 1];
      const b = B[i];
      for (const j of C) b.push(j);
    }
    return B;
  };
}

function mid1(x1, x2) {
  const m = (+x1 + +x2) / 2;
  return x1 instanceof Date ? new Date(m) : m;
}

const reduceX = {
  reduceIndex(I, X, {x1, x2}) {
    return mid1(x1, x2);
  }
};

const reduceY = {
  reduceIndex(I, X, {y1, y2}) {
    return mid1(y1, y2);
  }
};

const reduceX1 = {
  reduceIndex(I, X, {x1}) {
    return x1;
  }
};

const reduceX2 = {
  reduceIndex(I, X, {x2}) {
    return x2;
  }
};

const reduceY1 = {
  reduceIndex(I, X, {y1}) {
    return y1;
  }
};

const reduceY2 = {
  reduceIndex(I, X, {y2}) {
    return y2;
  }
};
