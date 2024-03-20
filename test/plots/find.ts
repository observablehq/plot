import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function findArrow() {
  const ages = ["Y16-19", "Y20-24", "Y25-29"];
  const sexes = ["M", "F"];
  const ilc = await d3.csv<any>("data/ilc_lvps08.csv", (d) =>
    d.geo === "EL" && sexes.includes(d.sex) && ages.includes(d.age) ? d3.autoType(d) : null
  );
  return Plot.plot({
    x: {tickFormat: "", label: null, inset: 10},
    y: {grid: true, label: "Greek youth living with parents (%, ↑more male, ↓more female)"},
    color: {legend: true},
    marks: [
      Plot.ruleY([0, 100]),
      Plot.lineY(ilc, {
        filter: (d) => d.sex === "F",
        x: "TIME_PERIOD",
        y: "OBS_VALUE",
        stroke: "age",
        strokeOpacity: 0.2
      }),
      Plot.lineY(ilc, {
        filter: (d) => d.sex === "M",
        x: "TIME_PERIOD",
        y: "OBS_VALUE",
        stroke: "age"
      }),
      Plot.arrow(
        ilc,
        Plot.groupX(
          {y1: Plot.find((d) => d.sex === "F"), y2: Plot.find((d) => d.sex === "M")},
          {x: "TIME_PERIOD", y: "OBS_VALUE", stroke: "age", bend: true}
        )
      )
    ]
  });
}
