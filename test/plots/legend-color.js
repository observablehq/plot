import * as Plot from "@observablehq/plot";

export default async function() {
  const plot = Plot.plot({color: {type: "diverging", domain: [-1, 1] }});
  return Plot.legend({color: plot, width: 500});
}
