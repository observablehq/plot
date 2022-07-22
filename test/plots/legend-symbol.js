import * as Plot from "@observablehq/plot";

export function symbolLegendBasic() {
  return Plot.legend({symbol: {domain: "ABCDEF"}});
}

export function symbolLegendColorFill() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}, fill: "color"});
}

export function symbolLegendColorStroke() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}});
}

export function symbolLegendFill() {
  return Plot.legend({symbol: {domain: "ABCDEF"}, fill: "red"});
}

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
export function symbolLegendDifferentColor() {
  return Plot.dotX("ABCDEF", {fill: (d) => d, symbol: (d) => d})
    .plot()
    .legend("symbol");
}

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
export function symbolLegendExplicitColor() {
  return Plot.dotX("ABCDEF", {fill: (d) => d, symbol: (d) => d})
    .plot()
    .legend("symbol", {fill: "color"});
}

// Note: The symbol hint requires reference equality for channel definitions; we
// can tell the mark that they represent the same encoding by passing the same
// function for both channels.
export function symbolLegendImplicitRange() {
  const identity = (d) => d;
  return Plot.dotX("ABCDEF", {fill: identity, symbol: identity}).plot().legend("symbol");
}

export function symbolLegendStroke() {
  return Plot.legend({symbol: {domain: "ABCDEF"}, stroke: "red"});
}
