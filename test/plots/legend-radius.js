import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.dotX([0, 1e6, 2e6, 8e6, 9e6, 1e7], {
    x: d => d,
    r: d => d,
    fill: "red"
  }).plot({ r: {range: [0, 30], label: "population (millions)", transform: d => d * 1e-6}});
  
  return chart.legend("r");
}
