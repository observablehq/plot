import * as Plot from "@observablehq/plot";
import type {LegendScales} from "@observablehq/plot";
import {select} from "d3";
import {test} from "test/plot";

function opacityLegends(options: LegendScales) {
  const doc = (typeof document !== "undefined" ? document : undefined) || Plot.legend(options).ownerDocument;
  const div = doc.createElement("div");
  div.style.cssText = "display: flex; gap: 20px;";
  for (const [bg, color] of [
    ["white", "black"],
    ["black", "white"]
  ]) {
    const box = doc.createElement("div");
    box.style.cssText = `background-color: ${bg}; color: ${color}; color-scheme: ${
      color === "white" ? "dark" : "light"
    }; padding: 20px;`;
    const svg = Plot.legend(options);
    select(svg).attr("style", `--plot-background: ${bg}`);
    box.appendChild(svg);
    div.appendChild(box);
  }
  return div;
}

test(function opacityLegend() {
  return opacityLegends({opacity: {domain: [0, 10], label: "Quantitative"}});
});

test(function opacityLegendRange() {
  return opacityLegends({opacity: {domain: [0, 1], range: [0.5, 1], label: "Range"}});
});

test(function opacityLegendLinear() {
  return opacityLegends({opacity: {type: "linear", domain: [0, 10], label: "Linear"}});
});

test(function opacityLegendColor() {
  return opacityLegends({opacity: {type: "linear", domain: [0, 10], label: "Linear"}, color: "steelblue"});
});

test(function opacityLegendLog() {
  return opacityLegends({opacity: {type: "log", domain: [1, 10], label: "Log"}});
});

test(function opacityLegendSqrt() {
  return opacityLegends({opacity: {type: "sqrt", domain: [0, 1], label: "Sqrt"}});
});

test(function opacityLegendCSS4() {
  return opacityLegends({opacity: {type: "linear", domain: [0, 1], label: "oklch"}, color: "oklch(70% 0.35 145)"});
});
