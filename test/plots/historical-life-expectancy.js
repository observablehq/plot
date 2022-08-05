import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const le = await d3.tsv("data/historical-life-expectancy.tsv").then((data) =>
    data.map(({ era, lifeexp }, i) => ({
      i,
      era,
      le: parseFloat(lifeexp.replace(/>/g, ""))
    }))
  );

  return Plot.plot({
    time: {
      domain: [...new Set(le.map(d => d.era))],
      duration: 13000
    },
    grid: true,
    marks: [
      Plot.barX(le, { time: "era", x: "le" }),
      Plot.text(le, { time: "era", text: "era", fill: "white", frameAnchor: "left", dx: 14 })
    ]
  });
}
