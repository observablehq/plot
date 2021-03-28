import {min, max, quantile, reverse} from "d3";
import {
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateNumber,
  interpolateRgb,
  interpolateRound,
  piecewise
} from "d3";
import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOranges,
  interpolateOrRd,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePRGn,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd
} from "d3";
import {scaleDiverging, scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3";
import {registry, radius, color} from "./index.js";
import {positive, negative} from "../defined.js";

const constant = x => () => x;
const flip = i => t => i(1 - t);

// TODO Allow this to be extended.
const interpolators = new Map([
  // numbers
  ["number", interpolateNumber],

  // color spaces
  ["rgb", interpolateRgb],
  ["hsl", interpolateHsl],
  ["hcl", interpolateHcl],
  ["lab", interpolateLab]
]);

// TODO Allow this to be extended.
const schemes = new Map([
  // diverging
  ["brbg", interpolateBrBG],
  ["prgn", interpolatePRGn],
  ["piyg", interpolatePiYG],
  ["puor", interpolatePuOr],
  ["rdbu", interpolateRdBu],
  ["rdgy", interpolateRdGy],
  ["rdylbu", interpolateRdYlBu],
  ["rdylgn", interpolateRdYlGn],
  ["spectral", interpolateSpectral],

  // inverted diverging (for temperature data)
  ["burd", t => interpolateRdBu(1 - t)],
  ["buylrd", t => interpolateRdYlBu(1 - t)],

  // sequential (single-hue)
  ["blues", interpolateBlues],
  ["greens", interpolateGreens],
  ["greys", interpolateGreys],
  ["purples", interpolatePurples],
  ["reds", interpolateReds],
  ["oranges", interpolateOranges],

  // sequential (multi-hue)
  ["turbo", interpolateTurbo],
  ["viridis", interpolateViridis],
  ["magma", interpolateMagma],
  ["inferno", interpolateInferno],
  ["plasma", interpolatePlasma],
  ["cividis", interpolateCividis],
  ["cubehelix", interpolateCubehelixDefault],
  ["warm", interpolateWarm],
  ["cool", interpolateCool],
  ["bugn", interpolateBuGn],
  ["bupu", interpolateBuPu],
  ["gnbu", interpolateGnBu],
  ["orrd", interpolateOrRd],
  ["pubugn", interpolatePuBuGn],
  ["pubu", interpolatePuBu],
  ["purd", interpolatePuRd],
  ["rdpu", interpolateRdPu],
  ["ylgnbu", interpolateYlGnBu],
  ["ylgn", interpolateYlGn],
  ["ylorbr", interpolateYlOrBr],
  ["ylorrd", interpolateYlOrRd],

  // cyclical
  ["rainbow", interpolateRainbow],
  ["sinebow", interpolateSinebow]
]);

function Interpolator(interpolate) {
  const i = (interpolate + "").toLowerCase();
  if (!interpolators.has(i)) throw new Error(`unknown interpolator: ${i}`);
  return interpolators.get(i);
}

function Scheme(scheme) {
  const s = (scheme + "").toLowerCase();
  if (!schemes.has(s)) throw new Error(`unknown scheme: ${s}`);
  return schemes.get(s);
}

export function ScaleQ(key, scale, channels, {
  nice,
  clamp,
  zero,
  domain = (registry.get(key) === radius ? inferRadialDomain : inferDomain)(channels),
  percent,
  round,
  range = registry.get(key) === radius ? inferRadialRange(channels, domain) : undefined,
  scheme,
  type,
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : scheme !== undefined ? Scheme(scheme) : type === "cyclical" ? interpolateRainbow : interpolateTurbo) : round ? interpolateRound : undefined,
  invert,
  inset
}) {
  if (zero) domain = domain[1] < 0 ? [domain[0], 0] : domain[0] > 0 ? [0, domain[1]] : domain;
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);

  // Sometimes interpolator is named interpolator, such as "lab" for Lab color
  // space. Other times interpolate is a function that takes two arguments and
  // is used in conjunction with the range. And other times the interpolate
  // function is a “fixed” interpolator independent of the range, as when a
  // color scheme such as interpolateRdBu is used.
  if (interpolate !== undefined) {
    if (typeof interpolate !== "function") {
      interpolate = Interpolator(interpolate);
    } else if (interpolate.length === 1) {
      if (invert) interpolate = flip(interpolate);
      interpolate = constant(interpolate);
    }
    scale.interpolate(interpolate);
  }

  if (range !== undefined) scale.range(range);
  if (clamp) scale.clamp(clamp);
  return {type: "quantitative", invert, domain, range, scale, inset, percent};
}

export function ScaleLinear(key, channels, options) {
  return ScaleQ(key, scaleLinear(), channels, options);
}

export function ScalePow(key, channels, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), channels, options);
}

export function ScaleLog(key, channels, {base = 10, domain = inferLogDomain(channels), ...options}) {
  return ScaleQ(key, scaleLog().base(base), channels, {domain, ...options});
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleDiverging(key, channels, {
  nice,
  clamp,
  domain = inferDomain(channels),
  pivot = 0,
  range,
  scheme,
  interpolate = registry.get(key) === color ? (range !== undefined ? interpolateRgb : scheme !== undefined ? Scheme(scheme) : interpolateRdBu) : undefined,
  invert
}) {
  domain = [Math.min(domain[0], pivot), pivot, Math.max(domain[1], pivot)];
  if (invert = !!invert) domain = reverse(domain);

  // Sometimes interpolator is named interpolator, such as "lab" for Lab color
  // space; other times it is a function that takes t in [0, 1].
  if (interpolate !== undefined && typeof interpolate !== "function") {
    interpolate = Interpolator(interpolate);
  }

  // If an explicit range is specified, promote it to a piecewise interpolator.
  if (range !== undefined) interpolate = piecewise(interpolate, range);

  const scale = scaleDiverging(domain, interpolate);
  if (clamp) scale.clamp(clamp);
  if (nice) scale.nice(nice);
  return {type: "quantitative", invert, domain, scale};
}

function inferDomain(channels, f) {
  return [
    min(channels, ({value}) => value === undefined ? value : min(value, f)),
    max(channels, ({value}) => value === undefined ? value : max(value, f))
  ];
}

function inferRadialDomain(channels) {
  return [0, max(channels, ({value}) => value === undefined ? value : max(value))];
}

// We don’t want the upper bound of the radial domain to be zero, as this would
// be degenerate, so we ignore nonpositive values.
function inferRadialRange(channels, domain) {
  const h25 = quantile(channels, 0.5, ({value}) => value === undefined ? NaN : quantile(value, 0.25, positive));
  return domain.map(d => 3 * Math.sqrt(d / h25));
}

function inferLogDomain(channels) {
  for (const {value} of channels) {
    if (value !== undefined) {
      for (let v of value) {
        v = +v;
        if (v > 0) return inferDomain(channels, positive);
        if (v < 0) return inferDomain(channels, negative);
      }
    }
  }
  return [1, 10];
}
