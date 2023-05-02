import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function ibmTrading() {
  const ibm = await d3.csv<any>("data/ibm.csv", d3.autoType).then((data) => data.slice(-20));
  return Plot.plot({
    marginBottom: 65,
    x: {
      interval: "day",
      tickRotate: -40,
      label: null
    },
    y: {
      transform: (d) => d / 1e6,
      label: "↑ Volume (USD, millions)",
      grid: true
    },
    marks: [Plot.barY(ibm, {x: "Date", y: "Volume"})]
  });
}
