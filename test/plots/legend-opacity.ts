import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

test(function opacityLegend() {
  return Plot.legend({opacity: {domain: [0, 10], label: "Quantitative"}});
});

test(function opacityLegendRange() {
  return Plot.legend({opacity: {domain: [0, 1], range: [0.5, 1], label: "Range"}});
});

test(function opacityLegendLinear() {
  return Plot.legend({opacity: {type: "linear", domain: [0, 10], label: "Linear"}});
});

test(function opacityLegendColor() {
  return Plot.legend({opacity: {type: "linear", domain: [0, 10], label: "Linear"}, color: "steelblue"});
});

test(function opacityLegendLog() {
  return Plot.legend({opacity: {type: "log", domain: [1, 10], label: "Log"}});
});

test(function opacityLegendSqrt() {
  return Plot.legend({opacity: {type: "sqrt", domain: [0, 1], label: "Sqrt"}});
});

test(function opacityLegendSwatches() {
  return Plot.legend({opacity: {type: "ordinal", domain: d3.range(10)}});
});

test(function opacityLegendSwatchesColor() {
  return Plot.legend({opacity: {type: "ordinal", domain: d3.range(10)}, color: "red"});
});

test(function opacityLegendCSS4() {
  return Plot.legend({opacity: {type: "linear", domain: [0, 1], label: "p3"}, color: "color(display-p3 0 1 0)"});
});
