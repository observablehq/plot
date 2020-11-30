import {min, max, quantile, reverse} from "d3-array";
import {
  interpolateHcl,
  interpolateHsl,
  interpolateLab,
  interpolateNumber,
  interpolateRgb,
  interpolateRound
} from "d3-interpolate";
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
} from "d3-scale-chromatic";
import {scaleDiverging, scaleLinear, scaleLog, scalePow, scaleSymlog} from "d3-scale";
import {registry, radius, color} from "./index.js";

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
  ["lab", interpolateLab],

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

export function ScaleQ(key, scale, channels, {
  nice,
  domain = (registry.get(key) === radius ? inferRadialDomain : inferDomain)(channels),
  round,
  range = registry.get(key) === radius ? [0, 3] : undefined, // see inferRadialDomain
  interpolate = round ? interpolateRound
    : registry.get(key) === color ? (range === undefined ? interpolateTurbo : interpolateRgb)
    : undefined,
  invert,
  inset
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (nice) scale.nice(nice === true ? undefined : nice);
  if (interpolate !== undefined) {
    if (typeof interpolate !== "function") {
      const i = (interpolate + "").toLowerCase();
      if (!interpolators.has(i)) throw new Error(`unknown interpolator: ${i}`);
      interpolate = interpolators.get(i);
    }
    // Sometimes interpolate is a function that takes two arguments and is used
    // in conjunction with the range; for example, interpolateLab might be used
    // to interpolate two colors in Lab color space. Other times the interpolate
    // function is a “fixed” interpolator independent of the range, as when a
    // color scheme such as interpolateRdBu is used.
    if (interpolate.length === 1) {
      if (invert) interpolate = flip(interpolate);
      interpolate = constant(interpolate);
    }
    scale.interpolate(interpolate);
  }
  if (range !== undefined) scale.range(range);
  return {type: "quantitative", invert, domain, range, scale, inset};
}

export function ScaleLinear(key, channels, options) {
  return ScaleQ(key, scaleLinear(), channels, options);
}

export function ScalePow(key, channels, {exponent = 1, ...options}) {
  return ScaleQ(key, scalePow().exponent(exponent), channels, options);
}

export function ScaleLog(key, channels, {base = 10, ...options}) {
  return ScaleQ(key, scaleLog().base(base), channels, options);
}

export function ScaleSymlog(key, channels, {constant = 1, ...options}) {
  return ScaleQ(key, scaleSymlog().constant(constant), channels, options);
}

export function ScaleDiverging(key, channels, {
  nice,
  domain = inferDomain(channels),
  pivot = 0,
  interpolate = registry.get(key) === color ? interpolateRdBu : undefined,
  invert
}) {
  domain = [Math.min(domain[0], pivot), pivot, Math.max(domain[1], pivot)];
  if (invert = !!invert) domain = reverse(domain);
  const scale = scaleDiverging(domain, interpolate);
  if (nice) scale.nice(nice);
  return {type: "quantitative", invert, domain, scale};
}

function inferDomain(channels) {
  return [
    min(channels, ({value}) => value === undefined ? value : min(value)),
    max(channels, ({value}) => value === undefined ? value : max(value))
  ];
}

function inferRadialDomain(channels) {
  return [
    0,
    quantile(channels, 0.5, ({value}) => value === undefined ? value : quantile(value, 0.25))
  ];
}
