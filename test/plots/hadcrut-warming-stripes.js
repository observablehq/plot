import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const hadcrut = (await d3.text("data/hadcrut-annual.txt"))
    .split(/\n/g) // split into lines
    .map(line => line.split(/\s+/g)) // split each line into fields
    .map(([year, anomaly]) => ({ // extract the year and median anomaly
      year: new Date(Date.UTC(year, 0, 1)),
      anomaly: +anomaly
    }));
  return Plot.plot({
    x: {
      round: true,
      label: null
    },
    color: {
      type: "diverging",
      scheme: "BuRd"
    },
    marks: [
      Plot.barX(hadcrut, {
        y: null,
        x1: "year", // start of current year
        x2: d => d3.utcYear.offset(d.year), // start of next year
        fill: "anomaly"
      })
    ]
  });
}
