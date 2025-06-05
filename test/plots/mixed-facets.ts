import * as Plot from "@observablehq/plot";

export async function mixedFacets() {
  const data = [
    {date: new Date("2024-01-01"), name: "a", value: 1},
    {date: new Date("2024-01-01"), name: "b", value: 2},
    {date: new Date("2024-01-01"), name: "a", value: 2},
    {date: new Date("2024-02-01"), name: "b", value: 3},
    {date: new Date("2024-02-01"), name: "a", value: 5},
    {date: new Date("2024-02-01"), name: "b", value: 2},
    {date: new Date("2024-02-01"), name: "a", value: 3}
  ];
  return Plot.plot({
    marks: [
      Plot.barY(data, {x: "name", y: "value", fill: "name", fx: "date", fy: "name"}),
      Plot.barY(data, {x: "name", y: "value", fx: "date", stroke: "currentColor"}),
      Plot.ruleY([0])
    ]
  });
}
