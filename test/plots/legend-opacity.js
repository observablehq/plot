import * as Plot from "@observablehq/plot";

export function opacityLegend() {
  return Plot.legend({opacity: {domain: [0, 10], label: "Quantitative"}});
}

export function opacityLegendRange() {
  return Plot.legend({opacity: {domain: [0, 1], range: [0.5, 1], label: "Range"}});
}

export function opacityLegendLinear() {
  return Plot.legend({opacity: {type: "linear", domain: [0, 10], label: "Linear"}});
}

export function opacityLegendColor() {
  return Plot.legend({opacity: {type: "linear", domain: [0, 10], label: "Linear"}, color: "steelblue"});
}

export function opacityLegendLog() {
  return Plot.legend({opacity: {type: "log", domain: [1, 10], label: "Log"}});
}

export function opacityLegendSqrt() {
  return Plot.legend({opacity: {type: "sqrt", domain: [0, 1], label: "Sqrt"}});
}
