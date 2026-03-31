import * as Plot from "@observablehq/plot";
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
