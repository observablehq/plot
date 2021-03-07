import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/penguins.csv", d3.autoType);
  
  return Plot.plot({
    marks: [
      Plot.rectY(data, Plot.stackY({...Plot.binX({
        thresholds: 30,
        x: "body_mass_g",
        z: "species",
        //order: "value",
        reverse: true,
        fill: "species",
        fillOpacity: .5,
        stroke: "black"
      }),
      x: "x0"
    }))
    ]
  });
}

/*
Plot.plot({
  facet: {
    data: penguins.data,
    x: "sex"
  },
  inset: 10,
  marks: [
    Plot.frame(),
    Plot.dot(penguins.data, bin.binR({
      thresholds: 10,
      x: "body_mass_g",
      y: "culmen_length_mm",
      z: "species",
      fill: "z",
      fillOpacity: .1,
      stroke: "z",
    }))
  ],
  width: 610,
  height: 300
})
*/