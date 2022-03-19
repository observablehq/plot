import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

function Likert(responses) {
  const map = new Map(responses);
  return {
    order: Array.from(map.keys()),
    offset(facetstacks, X1, X2, Z) {
      for (const stacks of facetstacks) {
        for (const stack of stacks) {
          const k = d3.sum(stack, i => (X2[i] - X1[i]) * (1 - map.get(Z[i]))) / 2;
          for (const i of stack) {
            X1[i] -= k;
            X2[i] -= k;
          }
        }
      }
    }
  };
}

export default async function() {
  const survey = await d3.csv("data/survey.csv");
  const {order, offset} = Likert([
    ["Strongly Disagree", -1],
    ["Disagree", -1],
    ["Neutral", 0],
    ["Agree", 1],
    ["Strongly Agree", 1]
  ]);
  return Plot.plot({
    x: {
      tickFormat: Math.abs,
      label: "← more disagree · Number of responses · more agree →",
      labelAnchor: "center"
    },
    y: {
      tickSize: 0
    },
    color: {
      legend: true,
      domain: order,
      scheme: "RdBu"
    },
    marks: [
      Plot.barX(survey, Plot.groupY({x: "count"}, {y: "Question", fill: "Response", order, offset})),
      Plot.ruleX([0])
    ]
  });
}
