import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.json("data/survey.json");
  const values = new Map([
    ["Strongly Disagree", -1],
    ["Disagree", -1],
    ["Neutral", 0],
    ["Agree", 1],
    ["Strongly Agree", 1]
  ]);
  const order = [...values.keys()];
  return Plot.plot({
    x: { tickFormat: Math.abs, label: "# of answers" },
    y: { tickSize: 0 },
    color: { legend: true, domain: order, scheme: "RdBu" },
    marks: [
      Plot.barX(
        data,
        Plot.groupY(
          { x: "count" },
          {
            y: "Question",
            fill: "Response",
            order,
            offset: (facetstacks, X1, X2, Z) => {
              for (const S of facetstacks) {
                for (const I of S) {
                  const offset =
                    d3.sum(I, (i) => (X2[i] - X1[i]) * (1 - values.get(Z[i]))) / 2;
                  for (const i of I) (X1[i] -= offset), (X2[i] -= offset);
                }
              }
            }
          }
        )
      ),
      Plot.ruleX([0])
    ]
  });
}
