import * as Plot from "@observablehq/plot";

export default async function() {
  const plot = Plot.plot({color: {type: "categorical", domain: ["A", "B", "C"] }});
  return Plot.legend({color: plot});
}
