import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesSample() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 100,
    x: {grid: true},
    color: {scheme: "dark2"},
    marks: [
      Plot.dotX(
        athletes,
        Plot.select((I) => I.filter((i) => i % 100 === 0), {
          x: "weight",
          y: "sport",
          fill: "sex",
          r: 5,
          title: "name"
        })
      )
    ]
  });
}

export async function athletesSampleFacet() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    x: {grid: true},
    color: {scheme: "dark2"},
    facet: {marginLeft: 100}, // TODO should this be top-level marginLeft?
    marks: [
      Plot.dotX(
        athletes,
        Plot.select((I) => I.filter((i) => i % 100 === 0), {
          x: "weight",
          fy: "sport",
          fill: "sex",
          r: 5,
          title: "name"
        })
      )
    ]
  });
}
