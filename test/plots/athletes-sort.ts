import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesSortFacet() {
  const athletes = await d3.csv<{sex: string; sport: string}>("data/athletes.csv", d3.autoType);
  const female = (d: (typeof athletes)[number]) => d.sex === "female";
  return Plot.plot({
    marginLeft: 100,
    marks: [
      Plot.barX(athletes, Plot.groupZ({x: "mean"}, {x: female, fy: "sport", sort: {fy: "x"}})),
      Plot.frame({anchor: "left", facet: "super"})
    ]
  });
}

export async function athletesSortNationality() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.dot(
        athletes,
        Plot.sort("height", {
          y: "weight",
          x: "height",
          stroke: "nationality",
          sort: {color: null, limit: 10}
        })
      )
    ]
  });
}

export async function athletesSortNullLimit() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [Plot.dot(athletes, {x: "height", y: "weight", stroke: "nationality", sort: {color: null, limit: 10}})]
  });
}

export async function athletesSortWeightLimit() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    color: {legend: true},
    marks: [
      Plot.dot(athletes, {x: "weight", y: "nationality", sort: {y: "x", reduce: "median", limit: 10}}),
      Plot.tickX(athletes, Plot.groupY({x: "median"}, {x: "weight", y: "nationality", stroke: "red", strokeWidth: 2}))
    ]
  });
}
