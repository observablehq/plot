import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.plot({color: {type: "categorical", domain: ["A", "B", "C"], label: "category" }});
  return chart.legend("color");
}
