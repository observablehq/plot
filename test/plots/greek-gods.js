import * as Plot from "@observablehq/plot";

export default async function() {
  const gods = `Chaos Gaia Mountains
Chaos Gaia Pontus
Chaos Gaia Uranus
Chaos Eros
Chaos Erebus
Chaos Tartarus`.split("\n").map(d => d.replace(/\s+/g, "/"));
  return Plot.plot({
    axis: null,
    insetLeft: 10,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [
      Plot.tree(gods)
    ]
  });
}
