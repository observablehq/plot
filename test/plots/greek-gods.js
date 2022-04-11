import * as Plot from "@observablehq/plot";

export default async function() {
  const gods = `Chaos Gaia Mountains
Chaos Gaia Pontus
Chaos Gaia Uranus
Chaos Eros
Chaos Erebus
Chaos Tartarus`.split("\n").map(d => d.split(" "));
  return Plot.tree(gods).plot();
}
