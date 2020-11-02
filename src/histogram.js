import {bin, extent, rollup, sum} from "d3-array";
import {inferDomain, inferOrdinalDomain} from "./domain.js";
import {Frame} from "./frame.js";
import {channel, identity, index, isBareValue, inferValues} from "./value.js";
import {Fragment} from "./mark/fragment.js";
import {RectXY} from "./mark/rect.js";
import {RuleX, RuleY} from "./mark/rule.js";

// A histogram has a primary dimension (which defaults to x) that is used to bin
// the data, and a secondary dimension (which defaults to y) which shows the
// count of input x-values per bin.

// TODO Currently the primary dimension is always x and the secondary y; what if
// you want to flip those two?

// TODO The primary dimension must currently be quantitative — no point or band
// scales - we should also support ordinal data, as when you want a histogram of
// letter or word frequencies from some source text. For this we’ll need
// d3.group instead of d3.bin, and the Column mark type instead of Rect.

const xDefaults = {value: identity};
const yDefaults = {label: "↑ Frequency", rules: [0]};

export function Histogram(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {x: options};
  const x = channel(options, "x", xDefaults);
  const y = channel(options, "y", yDefaults);
  const fx = channel(options, "fx");
  const fy = channel(options, "fy");
  const X = inferValues(data, x);
  const FX = fx && inferValues(data, fx);
  const FY = fy && inferValues(data, fy);
  const I = index(X);
  const fxDomain = fx && inferOrdinalDomain(FX, fx);
  const fyDomain = fy && inferOrdinalDomain(FY, fy);

  // If the x-domain was specified explicitly, it is passed to bin; otherwise,
  // it will be inferred from the x-extent of the (possibly niced) bins.
  let {domain: xDomain} = x;

  // Compute the bins. When faceting, these bins will need to be further
  // subdivided by each facet, but this initial computation is necessary to
  // compute the bin thresholds and domains which are shared by all facets.
  const {bin: {thresholds, normalize} = {}} = options;
  const binner = bin().value(i => X[i]);
  if (xDomain !== undefined) binner.domain(xDomain);
  if (thresholds !== undefined) binner.thresholds(thresholds);
  const bins = binner(I);

  // If the x-domain was not specified, compute the x-domain from the (possibly
  // niced) bins, then extend that to include any x-rules.
  if (xDomain === undefined) {
    xDomain = [bins[0].x0, bins[bins.length - 1].x1];
    if (x.rules) xDomain = extent([...xDomain, ...x.rules]);
  }

  // The set of bins and their x-extents are shared by all facets.
  const zero = new Float64Array(bins.length);
  const X1 = Float64Array.from(bins, binStart);
  const X2 = Float64Array.from(bins, binEnd);

  // Group the bins by facet. We can’t use the normal Facet primitive here
  // because the computed y-values and y-domain depends on the facets. TODO
  // Allow a custom y.value accessor function to be set, so that the caller can
  // determine how to weight the data? Or a custom bin.weight accessor?
  const yValue = normalize ? binRelative : binAbsolute;
  let Y, YV;
  if (fx && fy) [Y, YV] = binFacetXY(bins, FX, FY, fxDomain, fyDomain, yValue);
  else if (fx) [Y, YV] = binFacetX(bins, FX, fxDomain, yValue);
  else if (fy) [Y, YV] = binFacetY(bins, FY, fyDomain, yValue);
  else Y = YV = Float64Array.from(bins, yValue(bins));

  // If the y-domain was not specified explicitly, it is inferred from the
  // y-extent of the (possibly faceted) bins.
  const {domain: yDomain = inferDomain(YV, y)} = y;

  const {rect} = options;
  return Frame({
    height: 240,
    ...options,
    x: {domain: xDomain, ...x},
    y: {domain: yDomain, ...normalize && {format: "%"}, ...y},
    ...fx && {fx: {domain: fxDomain, ...fx}},
    ...fy && {fy: {domain: fyDomain, ...fy}},
    render: Fragment(
      ...x.rules ? Array.from(x.rules, RuleX) : [],
      ...y.rules ? Array.from(y.rules, RuleY) : [],
      (fx && fy ? RectFacetXY
        : fx ? RectFacetX
        : fy ? RectFacetY
        : RectXY)(X1, zero, X2, Y, rect)
    )
  });
}

function binStart(bin) {
  return bin.x0;
}

function binEnd(bin) {
  return bin.x1;
}

function binSize(bin) {
  return bin.length;
}

function binAbsolute() {
  return binSize;
}

function binRelative(bins) {
  const totalSize = sum(bins, binSize);
  return bin => bin.length / totalSize;
}

function binFacetXY(bins, FX, FY, fxDomain, fyDomain, yValue) {
  let Y = new Map(fxDomain.map(fx => [fx, new Map(fyDomain.map(fy => [fy, bins.map(() => [])]))]));
  for (let j = 0; j < bins.length; j++) {
    for (const i of bins[j]) {
      Y.get(FX[i]).get(FY[i])[j].push(i);
    }
  }
  for (const fx of fxDomain) {
    const y = Y.get(fx);
    for (const fy of fyDomain) {
      const bins = y.get(fy);
      y.set(fy, Array.from(bins, yValue(bins)));
    }
  }
  return [Y, Array.from(Y.values(), fy => Array.from(fy.values())).flat(2)];
}

function binFacetX(bins, FX, fxDomain, yValue) {
  let Y = new Map(fxDomain.map(fx => [fx, bins.map(() => [])]));
  for (let j = 0; j < bins.length; j++) {
    for (const i of bins[j]) {
      Y.get(FX[i])[j].push(i);
    }
  }
  for (const fx of fxDomain) {
    const bins = Y.get(fx);
    Y.set(fx, Array.from(bins, yValue(bins)));
  }
  return [Y, Array.from(Y.values()).flat()];
}

function binFacetY(bins, FY, fyDomain, yValue) {
  return binFacetX(bins, FY, fyDomain, yValue); // equivalent!
}

function RectFacetXY(X1, Y1, X2, Y2, options) {
  return (x, y, d, fx, fy) => RectXY(X1, Y1, X2, Y2.get(fx).get(fy), options)(x, y, d);
}

function RectFacetX(X1, Y1, X2, Y2, options) {
  return (x, y, d, fx) => RectXY(X1, Y1, X2, Y2.get(fx), options)(x, y, d);
}

function RectFacetY(X1, Y1, X2, Y2, options) {
  return (x, y, d, fx, fy) => RectXY(X1, Y1, X2, Y2.get(fy), options)(x, y, d);
}
