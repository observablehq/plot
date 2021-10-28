import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.legend({
    color: {
      scheme: "burd",
      domain: [-15, 35],
      label: "temperature"
    },
    width: 500,
    tickFormat: d => `${d > 0 ? "+" : ""}${d}°C`
  });
}
