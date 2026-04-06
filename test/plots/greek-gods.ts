import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function greekGods() {
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
    insetLeft: 35,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [Plot.tree(gods)]
  });
});

test(async function greekGodsTip() {
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
    insetLeft: 35,
    insetTop: 20,
    insetBottom: 20,
    insetRight: 120,
    marks: [Plot.tree(gods, {tip: true})]
  });
});

test(async function greekGodsExplicit() {
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
      Plot.text(
        gods,
        Plot.treeNode({
          text: "node:name",
          stroke: "var(--plot-background)",
          fill: "currentColor",
          dx: 6,
          delimiter: " "
        })
      )
    ]
  });
});
