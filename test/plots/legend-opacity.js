import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.dotX([{o: 0.1}, {o: 0.5}], {
    fillOpacity: "o"
  }).plot({ opacity: { domain: [0, 20], label: "opaque" }});
  return Plot.legend({opacity: chart.scale("opacity")});
}
