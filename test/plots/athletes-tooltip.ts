import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function athletesTooltip() {
  const athletes = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return Plot.plot({
    grid: true,
    fy: {
      label: "decade of birth",
      transform: (d) => `${Math.floor(d.getUTCFullYear() / 10) * 10}`
    },
    marks: [
      Plot.dot(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"}),
      Plot.tooltip(athletes, {x: "weight", y: "height", fx: "sex", fy: "date_of_birth"})
    ]
  });
}
