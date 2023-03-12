import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// This dataset is hierarchical:
//
// Total Primary Energy Production
//  ├ Total Fossil Fuels Production
//  │  ├ Coal Production
//  │  ├ Natural Gas (Dry) Production
//  │  ├ Crude Oil Production
//  │  └ Natural Gas Plant Liquids Production
//  ├ Nuclear Electric Power Production
//  └ Total Renewable Energy Production
//     ├ Biomass Energy Production
//     ├ Geothermal Energy Production
//     ├ Hydroelectric Power Production
//     ├ Solar Energy Production
//     └ Wind Energy Production
//
// We don’t want to double-count by stacking a series that is already
// represented by another series!
const types = new Map([
  ["Total Fossil Fuels Production", "Fossil fuels"],
  ["Nuclear Electric Power Production", "Nuclear"],
  ["Total Renewable Energy Production", "Renewable"]
]);

export async function energyProduction() {
  const energy = (await d3.csv<any>("data/energy-production.csv"))
    .filter((d) => d.YYYYMM.slice(-2) === "13") // only take annual data
    .filter((d) => types.has(d.Description)) // don’t double-count categories
    .map((d) => ({...d, Year: +d.YYYYMM.slice(0, 4), Value: +d.Value}));
  return Plot.plot({
    x: {
      tickFormat: "d",
      label: null
    },
    y: {
      label: "↑ Annual production (quads)"
    },
    color: {
      tickFormat: (t) => types.get(t),
      legend: true
    },
    marks: [
      Plot.rectY(energy, {x: "Year", interval: 1, y: "Value", fill: "Description", sort: {color: "height"}}),
      Plot.ruleY([0])
    ]
  });
}
