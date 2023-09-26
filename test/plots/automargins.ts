import * as Plot from "@observablehq/plot";
import {svg} from "htl";

export async function autoMargins() {
  return margins(false);
}

export async function autoMarginsMonospace() {
  return margins(true);
}

function margins(monospace) {
  const labels = ["0", "1", "200", "1e7", "-1e3", "A", "Ab", "Abc", "Abcd", "Abcde"];
  return svg`<svg width=640 height=${20 + labels.length * 50}>${labels.map(
    (label, i) =>
      svg`<g transform="translate(0,${i * 50})">${Plot.plot({
        x: {axis: null},
        y: {type: "band", domain: [label], label: "LABEL"},
        marks: [Plot.frame(), Plot.axisY({monospace})]
      })}`
  )}`;
}
