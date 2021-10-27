import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.dotX([0, 0.1, 0.2, 0.8, 0.9, 1], {
    x: d => d,
    r: d => d,
    fill: "red"
  }).plot({ r: { domain: [0, 20], label: "population" }});
  
  return chart.legend("r");
}
