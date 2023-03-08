import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

const dates = new Array(1e6);
const start = +new Date("2020-01-01");
const end = +new Date("2021-01-01");
const random = d3.randomLcg(42);
for (let i = 0; i < dates.length; ++i) dates[i] = new Date(random() * (end - start) + start);

export async function bin1m() {
  return Plot.plot({
    marks: [Plot.rectY(dates, Plot.binX({y: "count", data: "first"}))]
  });
}
