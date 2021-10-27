import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.plot({color: {scheme: "burd", domain: [-15, 35], label: "temperature" }});
  return chart.legend("color", {width: 500, tickFormat: d => `${d > 0 ? "+" : ""}${d}°C`});
}
