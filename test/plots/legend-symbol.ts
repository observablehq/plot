import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(function symbolLegendBasic() {
  return Plot.legend({symbol: {domain: "ABCDEF"}});
});

test(function symbolLegendColorFill() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}, fill: "color"});
});

test(function symbolLegendColorStroke() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}});
});

test(function symbolLegendFill() {
  return Plot.legend({symbol: {domain: "ABCDEF"}, fill: "red"});
});

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
test(function symbolLegendDifferentColor() {
  return Plot.dotX("ABCDEF", {fill: (d) => d, symbol: (d) => d})
    .plot()
    .legend("symbol");
});

// Note: The symbol hint requires reference equality for channel definitions,
// and so doesn’t consider the fill and symbol channels to be using the same
// encoding here.
test(function symbolLegendExplicitColor() {
  return Plot.dotX("ABCDEF", {fill: (d) => d, symbol: (d) => d})
    .plot()
    .legend("symbol", {fill: "color"});
});

// Note: The symbol hint requires reference equality for channel definitions; we
// can tell the mark that they represent the same encoding by passing the same
// function for both channels.
test(function symbolLegendImplicitRange() {
  const identity = (d) => d;
  return Plot.dotX("ABCDEF", {fill: identity, symbol: identity}).plot().legend("symbol");
});

test(function symbolLegendStroke() {
  return Plot.legend({symbol: {domain: "ABCDEF"}, stroke: "red"});
});

test(async function symbolLegendOpacityFill() {
  return Plot.legend({symbol: {domain: ["Dream", "Torgersen", "Biscoe"]}, fill: "red", fillOpacity: 0.5});
});

test(async function symbolLegendOpacityColor() {
  return Plot.legend({color: {domain: "ABCDEF"}, symbol: {domain: "ABCDEF"}, strokeOpacity: 0.5});
});

test(async function symbolLegendOpacityStroke() {
  return Plot.legend({symbol: {domain: ["Dream", "Torgersen", "Biscoe"]}, stroke: "red", strokeOpacity: 0.5});
});
