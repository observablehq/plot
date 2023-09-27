import * as Plot from "@observablehq/plot";
import {svg} from "htl";

export async function margins() {
  return marginChart(false);
}

export async function marginsMonospace() {
  return marginChart(true);
}

export async function marginsLabel() {
  return marginChart(false, "LABEL");
}

export async function marginsMonospaceLabel() {
  return marginChart(true, "LABEL");
}

function marginChart(monospace, label = null) {
  const ticks = [
    "0",
    "1",
    "200",
    "1e7",
    "-1e3",
    "A",
    "Ab",
    "Abc",
    "Abcd",
    "Abcde",
    "Abcdef",
    "Abcdefg",
    "Chinstrap",
    "Agriculture"
  ];
  return svg`<svg width=640 height=${20 + ticks.length * 40}>
      <line y2=${ticks.length * 40} stroke="red" />
      ${ticks.map(
        (tick, i) =>
          svg`<g transform="translate(0,${i * 40})">
      ${Plot.plot({
        marginTop: 0.5,
        marginBottom: 0.5,
        height: 36,
        x: {axis: null},
        y: {type: "band", domain: [tick], label},
        marks: [Plot.frame(), Plot.axisY({monospace, labelAnchor: label ? "center" : "top"})]
      })}`
      )}`;
}
