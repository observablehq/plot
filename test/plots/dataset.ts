import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function dataset() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  const xy = {x: "weight", y: "height"};
  return Plot.plot({
    grid: true,
    marks: [
      Plot.dot(athletes.slice(0, 10), {...xy, className: "named", dataset: "name", fill: "olive"}),
      Plot.dot(athletes.slice(10, 20), {...xy, className: "number", dataset: "height", fill: "steelblue"}),
      Plot.dot(athletes.slice(20, 30), {...xy, className: "identity", dataset: Plot.identity, fill: "orange"}),
      Plot.dot(athletes.slice(30, 40), {...xy, className: "date", dataset: "date_of_birth", fill: "green"}),
      Plot.dot(athletes.slice(40, 50), {...xy, className: "nullish", dataset: "nothing", fill: "grey"}),
      Plot.dot(athletes.slice(50, 60), {...xy, className: "labeled", dataset: {label: "sport", value: "sport"}})
    ]
  });
}

export async function datasetBars() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    marginLeft: 90,
    marks: [
      Plot.barX(
        athletes,
        Plot.groupY(
          {x: "count", dataset: (names: string[]) => JSON.stringify(names.slice(0, 10).concat(["..."]))},
          {
            y: "sport",
            dataset: "name",
            sort: {y: "-x", limit: 10}
          }
        )
      )
    ]
  });
}
