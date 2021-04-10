import {reverse as reverseof, sort} from "d3";
import {quantize} from "d3";
import {scaleBand, scaleOrdinal, scalePoint} from "d3";
import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolateOrRd,
  interpolatePiYG,
  interpolatePRGn,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSpectral,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
  interpolateTurbo,
  interpolateViridis,
  interpolateMagma,
  interpolateInferno,
  interpolatePlasma,
  interpolateCividis,
  interpolateCubehelixDefault,
  interpolateWarm,
  interpolateCool,
  interpolateRainbow,
  interpolateSinebow,
  schemeAccent,
  schemeBlues,
  schemeBrBG,
  schemeBuGn,
  schemeBuPu,
  schemeCategory10,
  schemeDark2,
  schemeGnBu,
  schemeGreens,
  schemeGreys,
  schemeOranges,
  schemeOrRd,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemePiYG,
  schemePRGn,
  schemePuBu,
  schemePuBuGn,
  schemePuOr,
  schemePuRd,
  schemePurples,
  schemeRdBu,
  schemeRdGy,
  schemeRdPu,
  schemeRdYlBu,
  schemeRdYlGn,
  schemeReds,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeSpectral,
  schemeTableau10,
  schemeYlGn,
  schemeYlGnBu,
  schemeYlOrBr,
  schemeYlOrRd
} from "d3";
import {ascendingDefined} from "../defined.js";
import {registry, color} from "./index.js";

// TODO Allow this to be extended.
const schemes = new Map([
  // categorical
  ["accent", schemeAccent],
  ["category10", schemeCategory10],
  ["dark2", schemeDark2],
  ["paired", schemePaired],
  ["pastel1", schemePastel1],
  ["pastel2", schemePastel2],
  ["set1", schemeSet1],
  ["set2", schemeSet2],
  ["set3", schemeSet3],
  ["tableau10", schemeTableau10],

  // diverging
  ["brbg", scheme11(schemeBrBG, interpolateBrBG)],
  ["prgn", scheme11(schemePRGn, interpolatePRGn)],
  ["piyg", scheme11(schemePiYG, interpolatePiYG)],
  ["puor", scheme11(schemePuOr, interpolatePuOr)],
  ["rdbu", scheme11(schemeRdBu, interpolateRdBu)],
  ["rdgy", scheme11(schemeRdGy, interpolateRdGy)],
  ["rdylbu", scheme11(schemeRdYlBu, interpolateRdYlBu)],
  ["rdylgn", scheme11(schemeRdYlGn, interpolateRdYlGn)],
  ["spectral", scheme11(schemeSpectral, interpolateSpectral)],

  // reversed diverging (for temperature data)
  ["burd", scheme11r(schemeRdBu, interpolateRdBu)],
  ["buylrd", scheme11r(schemeRdGy, interpolateRdGy)],

  // sequential (single-hue)
  ["blues", scheme9(schemeBlues, interpolateBlues)],
  ["greens", scheme9(schemeGreens, interpolateGreens)],
  ["greys", scheme9(schemeGreys, interpolateGreys)],
  ["oranges", scheme9(schemeOranges, interpolateOranges)],
  ["purples", scheme9(schemePurples, interpolatePurples)],
  ["reds", scheme9(schemeReds, interpolateReds)],

  // sequential (multi-hue)
  ["turbo", schemei(interpolateTurbo)],
  ["viridis", schemei(interpolateViridis)],
  ["magma", schemei(interpolateMagma)],
  ["inferno", schemei(interpolateInferno)],
  ["plasma", schemei(interpolatePlasma)],
  ["cividis", schemei(interpolateCividis)],
  ["cubehelix", schemei(interpolateCubehelixDefault)],
  ["warm", schemei(interpolateWarm)],
  ["cool", schemei(interpolateCool)],
  ["bugn", scheme9(schemeBuGn, interpolateBuGn)],
  ["bupu", scheme9(schemeBuPu, interpolateBuPu)],
  ["gnbu", scheme9(schemeGnBu, interpolateGnBu)],
  ["orrd", scheme9(schemeOrRd, interpolateOrRd)],
  ["pubu", scheme9(schemePuBu, interpolatePuBu)],
  ["pubugn", scheme9(schemePuBuGn, interpolatePuBuGn)],
  ["purd", scheme9(schemePuRd, interpolatePuRd)],
  ["rdpu", scheme9(schemeRdPu, interpolateRdPu)],
  ["ylgn", scheme9(schemeYlGn, interpolateYlGn)],
  ["ylgnbu", scheme9(schemeYlGnBu, interpolateYlGnBu)],
  ["ylorbr", scheme9(schemeYlOrBr, interpolateYlOrBr)],
  ["ylorrd", scheme9(schemeYlOrRd, interpolateYlOrRd)],

  // cyclical
  ["rainbow", schemei(interpolateRainbow)],
  ["sinebow", schemei(interpolateSinebow)]
]);

function scheme9(scheme, interpolate) {
  return ({length: n}) => {
    n = n > 3 ? Math.floor(n) : 3;
    return n > 9 ? quantize(interpolate, n) : scheme[n];
  };
}

function scheme11(scheme, interpolate) {
  return ({length: n}) => {
    n = n > 3 ? Math.floor(n) : 3;
    return n > 11 ? quantize(interpolate, n) : scheme[n];
  };
}

function scheme11r(scheme, interpolate) {
  return ({length: n}) => {
    n = n > 3 ? Math.floor(n) : 3;
    return n > 11 ? quantize(t => interpolate(1 - t), n) : scheme[n].slice().reverse();
  };
}

function schemei(interpolate) {
  return ({length: n}) => {
    return quantize(interpolate, n > 0 ? Math.floor(n) : 0);
  };
}

function Scheme(scheme) {
  const s = (scheme + "").toLowerCase();
  if (!schemes.has(s)) throw new Error(`unknown scheme: ${s}`);
  return schemes.get(s);
}

export function ScaleO(scale, channels, {
  domain = inferDomain(channels),
  range,
  reverse,
  inset
}) {
  if (reverse = !!reverse) domain = reverseof(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type: "ordinal", reverse, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  scheme,
  type,
  range = registry.get(key) === color ? (scheme !== undefined ? Scheme(scheme)
    : type === "ordinal" ? schemes.get("turbo")
    : schemeTableau10) : undefined,
  ...options
}) {
  return ScaleO(scaleOrdinal().unknown(undefined), channels, {range, ...options});
}

export function ScalePoint(key, channels, {
  align = 0.5,
  padding = 0.5,
  ...options
}) {
  return maybeRound(
    scalePoint()
      .align(align)
      .padding(padding),
    channels,
    options
  );
}

export function ScaleBand(key, channels, {
  align = 0.5,
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = key === "fx" || key === "fy" ? 0 : padding,
  ...options
}) {
  return maybeRound(
    scaleBand()
      .align(align)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter),
    channels,
    options
  );
}

function maybeRound(scale, channels, options = {}) {
  const {round} = options;
  if (round !== undefined) scale.round(round);
  scale = ScaleO(scale, channels, options);
  scale.round = round;
  return scale;
}

function inferDomain(channels) {
  const domain = new Set();
  for (const {value} of channels) {
    if (value === undefined) continue;
    for (const v of value) domain.add(v);
  }
  return sort(domain, ascendingDefined);
}
