import {reverse, sort} from "d3-array";
import {scaleBand, scaleOrdinal, scalePoint} from "d3-scale";
import {
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
} from "d3-scale-chromatic";
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
  ["brbg", scheme11(schemeBrBG)],
  ["prgn", scheme11(schemePRGn)],
  ["piyg", scheme11(schemePiYG)],
  ["puor", scheme11(schemePuOr)],
  ["rdbu", scheme11(schemeRdBu)],
  ["rdgy", scheme11(schemeRdGy)],
  ["rdylbu", scheme11(schemeRdYlBu)],
  ["rdylgn", scheme11(schemeRdYlGn)],
  ["spectral", scheme11(schemeSpectral)],

  // sequential (single-hue)
  ["blues", scheme9(schemeBlues)],
  ["greens", scheme9(schemeGreens)],
  ["greys", scheme9(schemeGreys)],
  ["oranges", scheme9(schemeOranges)],
  ["purples", scheme9(schemePurples)],
  ["reds", scheme9(schemeReds)],

  // sequential (multi-hue)
  ["bugn", scheme9(schemeBuGn)],
  ["bupu", scheme9(schemeBuPu)],
  ["gnbu", scheme9(schemeGnBu)],
  ["orrd", scheme9(schemeOrRd)],
  ["pubu", scheme9(schemePuBu)],
  ["pubugn", scheme9(schemePuBuGn)],
  ["purd", scheme9(schemePuRd)],
  ["rdpu", scheme9(schemeRdPu)],
  ["ylgn", scheme9(schemeYlGn)],
  ["ylgnbu", scheme9(schemeYlGnBu)],
  ["ylorbr", scheme9(schemeYlOrBr)],
  ["ylorrd", scheme9(schemeYlOrRd)]
]);

function scheme9(scheme) {
  return ({length}) => scheme[Math.max(3, Math.min(9, length))];
}

function scheme11(scheme) {
  return ({length}) => scheme[Math.max(3, Math.min(11, length))];
}

function Scheme(scheme) {
  const s = (scheme + "").toLowerCase();
  if (!schemes.has(s)) throw new Error(`unknown scheme: ${s}`);
  return schemes.get(s);
}

export function ScaleO(scale, channels, {
  domain = inferDomain(channels),
  range,
  invert,
  inset
}) {
  if (invert = !!invert) domain = reverse(domain);
  scale.domain(domain);
  if (range !== undefined) {
    // If the range is specified as a function, pass it the domain.
    if (typeof range === "function") range = range(domain);
    scale.range(range);
  }
  return {type: "ordinal", invert, domain, range, scale, inset};
}

export function ScaleOrdinal(key, channels, {
  scheme,
  range = registry.get(key) === color ? (scheme !== undefined ? Scheme(scheme) : schemeTableau10) : undefined,
  ...options
}) {
  const scale = scaleOrdinal();
  if (range !== undefined) scale.range(range);
  return ScaleO(scale, channels, {range, ...options});
}

export function ScalePoint(key, channels, {
  align = 0.5,
  padding = 0.5,
  round = true,
  ...options
}) {
  return ScaleO(
    scalePoint()
      .align(align)
      .padding(padding)
      .round(round),
    channels,
    options
  );
}

export function ScaleBand(key, channels, {
  align = 0.5,
  padding = 0.1,
  paddingInner = padding,
  paddingOuter = padding,
  round = true,
  ...options
}) {
  return ScaleO(
    scaleBand()
      .align(align)
      .paddingInner(paddingInner)
      .paddingOuter(paddingOuter)
      .round(round),
    channels,
    options
  );
}

function inferDomain(channels) {
  const domain = new Set();
  for (const {value} of channels) {
    if (value === undefined) continue;
    for (const v of value) domain.add(v);
  }
  return sort(domain, ascendingDefined);
}
