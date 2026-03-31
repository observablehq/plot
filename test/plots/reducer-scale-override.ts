import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import {test} from "test/plot";

async function reducerScaleOverride(reduce: Plot.Reducer) {
  const penguins = await d3.csv<any>("data/penguins.csv", d3.autoType);
  return Plot.barY(
    penguins,
    Plot.groupX(
      {y: "count", fill: {reduce, scale: true}},
      {x: "species", fill: (d) => (d.island === "Biscoe" ? "orange" : "green"), fy: "sex"}
    )
  ).plot();
}

test(async function reducerScaleOverrideFunction() {
  return reducerScaleOverride((values) => d3.mode(values));
});

test(async function reducerScaleOverrideImplementation() {
  return reducerScaleOverride({reduceIndex: (index, values) => d3.mode(index, (i) => values[i])});
});

test(async function reducerScaleOverrideName() {
  return reducerScaleOverride("mode");
});
