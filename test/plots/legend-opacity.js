import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.dotX({length: 100}, {
    x: Math.random,
    y: Math.random,
    r: Math.random,
    fill: Math.random,
    fillOpacity: Math.random
  }).plot({ r: { domain: [0, 20], label: "hello, radius" }});
  
  return Plot.legend({opacity: chart});
}
