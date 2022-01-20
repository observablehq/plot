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
  quantize,
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

const ordinalSchemes = new Map([
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
  ["buylrd", scheme11r(schemeRdYlBu, interpolateRdYlBu)],

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
  ["rainbow", schemeicyclical(interpolateRainbow)],
  ["sinebow", schemeicyclical(interpolateSinebow)]
]);

function scheme9(scheme, interpolate) {
  return ({length: n}) => {
    if (n === 1) return [scheme[3][1]]; // favor midpoint
    if (n === 2) return [scheme[3][0], scheme[3][2]]; // favor extrema
    n = Math.max(3, Math.floor(n));
    return n > 9 ? quantize(interpolate, n) : scheme[n];
  };
}

function scheme11(scheme, interpolate) {
  return ({length: n}) => {
    if (n === 2) return [scheme[3][0], scheme[3][2]]; // favor diverging extrema
    n = Math.max(3, Math.floor(n));
    return n > 11 ? quantize(interpolate, n) : scheme[n];
  };
}

function scheme11r(scheme, interpolate) {
  return ({length: n}) => {
    if (n === 2) return [scheme[3][2], scheme[3][0]]; // favor diverging extrema
    n = Math.max(3, Math.floor(n));
    return n > 11 ? quantize(t => interpolate(1 - t), n) : scheme[n].slice().reverse();
  };
}

function schemei(interpolate) {
  return ({length: n}) => quantize(interpolate, Math.max(2, Math.floor(n)));
}

function schemeicyclical(interpolate) {
  return ({length: n}) => quantize(interpolate, Math.floor(n) + 1).slice(0, -1);
}

export function ordinalScheme(scheme) {
  const s = `${scheme}`.toLowerCase();
  if (!ordinalSchemes.has(s)) throw new Error(`unknown scheme: ${s}`);
  return ordinalSchemes.get(s);
}

export function ordinalRange(scheme, length) {
  const s = ordinalScheme(scheme);
  const r = typeof s === "function" ? s({length}) : s;
  return r.length !== length ? r.slice(0, length) : r;
}

// If the specified domain contains only booleans (ignoring null and undefined),
// returns a corresponding range where false is mapped to the low color and true
// is mapped to the high color of the specified scheme.
export function maybeBooleanRange(domain, scheme = "greys") {
  const range = new Set();
  const [f, t] = ordinalRange(scheme, 2);
  for (const value of domain) {
    if (value == null) continue;
    if (value === true) range.add(t);
    else if (value === false) range.add(f);
    else return;
  }
  return [...range];
}

const quantitativeSchemes = new Map([
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

  // reversed diverging (for temperature data)
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

export function quantitativeScheme(scheme) {
  const s = `${scheme}`.toLowerCase();
  if (!quantitativeSchemes.has(s)) throw new Error(`unknown scheme: ${s}`);
  return quantitativeSchemes.get(s);
}
