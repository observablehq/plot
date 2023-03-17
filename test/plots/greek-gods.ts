import * as Plot from "@observablehq/plot";

export async function greekGods() {
  const gods = `Chaos Gaia Mountains
Chaos Gaia Pontus
Chaos Gaia Uranus
Chaos Eros
Chaos Erebus
Chaos Tartarus`
    .split("\n")
    .map((d) => d.replace(/\s+/g, "/"));
  return Plot.plot({
    axis: null,
    insetLeft: 10,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [Plot.tree(gods)]
  });
}

export async function greekGodsExplicit() {
  const gods = `Chaos Gaia Mountains
Chaos Gaia Pontus
Chaos Gaia Uranus
Chaos Eros
Chaos Erebus
Chaos Tartarus`.split("\n");
  return Plot.plot({
    axis: null,
    insetLeft: 10,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [
      Plot.link(gods, Plot.treeLink({stroke: "node:internal", delimiter: " "})),
      Plot.dot(gods, Plot.treeNode({fill: "node:internal", delimiter: " "})),
      Plot.text(gods, Plot.treeNode({text: "node:name", stroke: "white", fill: "currentColor", dx: 6, delimiter: " "}))
    ]
  });
}
