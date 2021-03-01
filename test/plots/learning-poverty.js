import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/learning-poverty.csv", d3.autoType);
  const values = data.flatMap(d => [
    { ...d, type: "ok", share: 100 - d["Learning Poverty"] },
    { ...d, type: "poor", share: d["Learning Poverty"] -  d["Out-of-School (OoS)"] },
    { ...d, type: "out of school", share: d["Out-of-School (OoS)"] }
  ]);
  return Plot.plot({
    x: {
      grid: true, ticks: 20, tickFormat: d => `${Math.abs(d)}%`, nice: true
    },
    y: {
      domain: d3.sort(data, d => d["Learning Poverty"]).map(d => d["Country Name"]).reverse()
    },
    color: {
      domain: ["ok", "poor", "out of school"],
      range: ["#aed9e0", "#EDD382", "#ffa69e"]
    },
    marks: [
      Plot.stackBarX(values, {
        x: d => (d.type === "ok" ? -1 : 1) * d.share, // diverging bars
        fill: "type",
        y: "Country Name"
      }),
      Plot.ruleX([0])
    ],
    marginLeft: 150,
    height: 1200
  });
}
