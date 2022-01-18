import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export function symbolLegendBasic() {
  return Plot.legend({symbol: {domain: "ABCDEF"}});
}

// TODO It would be nice if the symbol scale’s range automatically defaulted to
// d3.symbolsFill given the presence of fill “color”.
export function symbolLegendColorFill() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF", range: d3.symbolsFill}, fill: "color"});
}

// TODO It would be nice if the stroke option defaulted to “color” given the
// presence of a color scale (and no fill option).
export function symbolLegendColorStroke() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}, stroke: "color"});
}

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
export function symbolLegendDifferentColor() {
  return Plot.dotX("ABCDEF", {fill: d => d, symbol: d => d}).plot().legend("symbol");
}

// TODO It would be nice if the symbol scale’s range automatically defaulted to
// d3.symbolsFill given the presence of the fill option.
export function symbolLegendFill() {
  return Plot.legend({symbol: {domain: "ABCDEF", range: d3.symbolsFill}, fill: "red"});
}

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
export function symbolLegendExplicitColor() {
  return Plot.dotX("ABCDEF", {fill: d => d, symbol: d => d}).plot().legend("symbol", {fill: "color"});
}

// Note: The symbol hint requires reference equality for channel definitions; we
// can tell the mark that they represent the same encoding by passing the same
// function for both channels.
export function symbolLegendImplicitRange() {
  const identity = d => d;
  return Plot.dotX("ABCDEF", {fill: identity, symbol: identity}).plot().legend("symbol");
}

export function symbolLegendStroke() {
  return Plot.legend({symbol: {domain: "ABCDEF"}, stroke: "red"});
}
