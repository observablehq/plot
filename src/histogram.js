import {bin, extent, sum} from "d3-array";
import {inferDomain, inferOrdinalDomain} from "./domain.js";
import {Frame} from "./frame.js";
import {identity, index, isBareValue, inferValues, normalizeValue} from "./value.js";
import {Fragment} from "./mark/fragment.js";
import {RectXY} from "./mark/rect.js";
import {RuleX, RuleY} from "./mark/rule.js";

// A histogram has a primary dimension (which defaults to x) that is used to bin
// the data, and a secondary dimension (which defaults to y) which shows the
// count of input x-values per bin.

// TODO Currently the primary dimension is always x and the secondary y; what if
// you want to flip those two?

// TODO If you want to assign a different weight for each input value, rather
// than treating them equally, you can do that with a custom y.value.
// Theoretically this means that you could pass in already-binned data?

// TODO The primary dimension must currently be quantitative — no point or band
// scales - we should also support ordinal data, as when you want a histogram of
// letter or word frequencies from some source text. For this we’ll need
// d3.group instead of d3.bin, and the Column mark type instead of Rect.

export function Histogram(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {x: options};
  options = normalizeValue(options, "x");
  options = normalizeValue(options, "y");
  options = normalizeValue(options, "fy");

  // If no y-rules were specified, add a default rule at y = 0.
  // TODO It would be nice to incorporate this into normalizeValue?
  // TODO Maybe rename normalizeValue to normalizeChannel?
  if (!options.y || options.y.rules === undefined) {
    options = {...options, y: {...options.y, rules: [0]}};
  }

  // Compute the x-values.
  const {x: {value: xValue = identity} = {}} = options;
  const X = inferValues(data, xValue);

  // Compute an index from X to refer to input data.
  const I = index(X);

  // Extract the facet dimensions, if any. TODO fx.
  const {fy: {value: fyValue} = {}} = options;
  const FY = inferValues(data, fyValue);
  const fyDomain = options.fy && inferOrdinalDomain(FY, options.fy);
  // const fxDomain = options.fx && inferOrdinalDomain(FX, options.fx);

  // If the x-domain was specified, it is passed to d3.bin; otherwise, it will
  // be inferred from the x-extent of the (possibly niced) bins.
  let {x: {domain: xDomain} = {}} = options;

  // Compute the bins. When faceting, these bins will need to be further
  // subdivided by each facet, but this initial computation is necessary to
  // compute the bin thresholds and domains which are shared by all facets.
  const {bin: {thresholds, normalize} = {}} = options;
  const binner = bin().value(i => X[i]);
  if (xDomain !== undefined) binner.domain(xDomain);
  if (thresholds !== undefined) binner.thresholds(thresholds);
  const bins = binner(I);

  // Extract the rule values; these will be used to extend the respective domain
  // if the domain is not explicitly specified.
  const {
    x: {rules: xRules} = {},
    y: {rules: yRules = [0]} = {}
  } = options;

  // Compute the x-domain from the (possibly niced) bins.
  if (xDomain === undefined) {
    xDomain = [bins[0].x0, bins[bins.length - 1].x1];
    if (xRules) xDomain = extent([...xDomain, ...xRules]);
  }

  // The set of bins and their x-extents are shared by all facets.
  const zero = new Float64Array(bins.length);
  const X1 = Float64Array.from(bins, binStart);
  const X2 = Float64Array.from(bins, binEnd);

  // The y-value for each bin varies across facets.
  // TODO let {y: {value: yValue} = {}} = options;
  let Y, yDomain;

  // Group the binned by facet. TODO fx, yValue.
  if (options.fy) {
    Y = new Map(fyDomain.map(fy => [fy, bins.map(() => [])]));
    for (let j = 0; j < bins.length; j++) {
      for (const i of bins[j]) {
        Y.get(FY[i])[j].push(i);
      }
    }
    for (const fy of fyDomain) {
      const bins = Y.get(fy);
      Y.set(fy, Array.from(bins, normalize ? binProbability(bins) : binSize));
    }
    yDomain = inferDomain(Array.from(Y.values()).flat(), options.y);
  } else {
    Y = Float64Array.from(bins, normalize ? binProbability(bins) : binSize);
    yDomain = inferDomain(Y, options.y);
  }

  return Frame({
    height: 240,
    ...options,
    x: {domain: xDomain, ...options.x},
    y: {
      domain: yDomain,
      label: "↑ Frequency",
      ...normalize && {format: "%"},
      ...options.y
    },
    // ...options.fx && {fx: {domain: fxDomain, ...options.fx}},
    ...options.fy && {fy: {domain: fyDomain, ...options.fy}},
    render: Fragment(
      ...xRules ? Array.from(xRules, RuleX) : [],
      ...yRules ? Array.from(yRules, RuleY) : [],
      options.fy ? RectFY(X1, zero, X2, Y, options.line)
        : RectXY(X1, zero, X2, Y, options.rect)
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

function binProbability(bins) {
  const n = sum(bins, binSize);
  return bin => bin.length / n;
}

function RectFY(X1, Y1, X2, Y2, options) {
  return (x, y, d, fx, fy) => {
    return RectXY(X1, Y1, X2, Y2.get(fy), options)(x, y, d);
  };
}
