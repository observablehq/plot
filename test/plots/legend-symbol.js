import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export function symbolLegendBasic() {
  return Plot.legend({symbol: {domain: "ABCDEF"}});
}

// TODO There’s no way to define a standalone symbol legend with a color scale,
// since the color scale takes priority if both are specified.
export function symbolLegendColorFill() {
  return Plot.plot({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF", range: d3.symbolsFill}}).legend("symbol", {fill: "color"});
}

// TODO There’s no way to define a standalone symbol legend with a color scale,
// since the color scale takes priority if both are specified.
export function symbolLegendColorStroke() {
  return Plot.plot({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}}).legend("symbol", {stroke: "color"});
}

// TODO It would be nice if the symbol hint could apply here; but the hint is
// currently only set by marks that have matching channels.
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
