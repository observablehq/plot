import {bin, extent} from "d3-array";
import {inferDomain} from "./domain.js";
import {Frame} from "./frame.js";
import {identity, isBareValue, inferValues, normalizeValue} from "./value.js";
import {Fragment} from "./mark/fragment.js";
import {RectXY} from "./mark/rect.js";
import {RuleX, RuleY} from "./mark/rule.js";

// A histogram has a primary dimension (which defaults to x) that is used to bin
// the data, and a secondary dimension (which defaults to y) which shows the
// count of input x-values per bin.

// If you want to assign a different weight for each input value, rather than
// treating them equally, you can do that with a custom y.value. Theoretically
// this means that you could pass in already-binned data?

// TODO Faceting.

// TODO Currently the primary dimension is always x and the secondary y; what if
// you want to flip those two?

// TODO The primary dimension must currently be quantitative — no point or band
// scales - we should also support ordinal data, as when you want a histogram of
// letter or word frequencies from some source text. For this we’ll need
// d3.group instead of d3.bin, and the Column mark type instead of Rect.

// TODO When faceting, the primary dimension should have a shared domain, but
// maybe not for the secondary dimension? It should be optional.

export function Histogram(data, options = {}) {
  const A = arguments, a = A.length;
  if (a === 2 && isBareValue(options)) options = {x: options};
  options = normalizeValue(options, "x");
  options = normalizeValue(options, "y");
  // options = normalizeValue(options, "fx");
  // options = normalizeValue(options, "fy");
  const {bin: {thresholds, normalize} = {}} = options;
  const {x: {value: xValue = identity, rules: xRules} = {}} = options;
  // fx: {value: fxValue} = {},
  // fy: {value: fyValue} = {},
  const X = inferValues(data, xValue);
  let {x: {domain: xDomain} = {}} = options;
  const binner = bin();
  if (xDomain !== undefined) binner.domain(xDomain);
  if (thresholds !== undefined) binner.thresholds(thresholds);
  const bins = binner(X);
  const {
    y: {
      value: yValue = normalize ? binProbability(X.length) : binSize,
      rules: yRules = [0]
    } = {}
  } = options;
  if (xDomain === undefined) xDomain = [bins[0].x0, bins[bins.length - 1].x1];
  const zero = new Float64Array(bins.length);
  const X1 = Float64Array.from(bins, binStart);
  const X2 = Float64Array.from(bins, binEnd);
  const Y = Float64Array.from(bins, yValue);
  let yDomain = inferDomain(Y, options.y);
  if (xRules) xDomain = extent([...xRules, ...xDomain]);
  if (yRules) yDomain = extent([...yRules, ...yDomain]);
  // const FX = inferValues(data, fxValue);
  // const FY = inferValues(data, fyValue);
  // const fxDomain = options.fx && inferOrdinalDomain(FX, options.fx);
  // const fyDomain = options.fy && inferOrdinalDomain(FY, options.fy);
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
    // ...options.fy && {fy: {domain: fyDomain, ...options.fy}},
    render: Fragment(
      ...xRules ? Array.from(xRules, RuleX) : [],
      ...yRules ? Array.from(yRules, RuleY) : [],
      RectXY(X1, zero, X2, Y, options.rect)
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

function binProbability(n) {
  return bin => bin.length / n;
}
