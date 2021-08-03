import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/software-versions.csv");
  return Plot.plot({
    x: { percent: true },
    color: { scheme: "blues" },
    marks: [
      Plot.barX(
        data,
        Plot.stackX(
          Plot.groupZ(
            {
              x: "proportion",
              text: "first"
            },
            {
              fill: "key",
              text: "key",
              order: "value",
              stroke: "black"
            }
          )
        )
      ),
      Plot.text(
        data,
        Plot.stackX(
          Plot.groupZ(
            {
              x: "proportion",
              text: "first"
            },
            {
              z: "key",
              text: "key",
              order: "value"
            }
          )
        )
      ),
      Plot.frame()
    ],
    width: 940
  });
}
