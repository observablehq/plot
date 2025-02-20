import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function ordinalOpacity() {
  return Plot.cellX(d3.range(10), {fill: "red", opacity: Plot.identity}).plot({opacity: {type: "ordinal"}});
}

export async function ordinalOpacityImplicitZero() {
  return Plot.cellX(d3.range(2, 10), {fill: "red", opacity: Plot.identity}).plot({opacity: {type: "ordinal"}});
}
