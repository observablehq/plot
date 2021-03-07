import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  
  return Plot.plot({
    marks: [
      Plot.rect(data, Plot.stackY(Plot.binX({
        thresholds: 30,
        x: "body_mass_g",
        z: "species",
        //order: "value",
        reverse: true,
        fill: "species",
        fillOpacity: .5,
        stroke: "black"
      })))
    ]
  });
}