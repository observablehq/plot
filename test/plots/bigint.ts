import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import * as Arrow from "apache-arrow";

const integers = d3.range(40).map((int) => ({
  big1: BigInt(int),
  big2: BigInt(int * int)
}));

export async function bigint1() {
  return Plot.auto(integers, {x: "big2"}).plot();
}

export async function bigint2() {
  return Plot.line(integers, {x: "big1", y: "big2", marker: "circle"}).plot();
}

export async function bigintLog() {
  return Plot.tickX(integers, {x: "big2", stroke: "big1"}).plot({x: {type: "log"}});
}

export async function bigintOrdinal() {
  return Plot.cellX(integers.slice(1, 11), {x: "big1", fill: "big1"}).plot({color: {type: "log", legend: true}});
}

export async function bigintStack() {
  return Plot.barY(integers, {x: (d, i) => i % 5, y: "big1"}).plot();
}

export async function bigintNormalize() {
  const table = await Arrow.tableFromIPC(fetch("data/height_frequency.arrow"));
  return Plot.plot({
    height: 500,
    x: {percent: true, grid: true},
    y: {domain: [1.3, 2.21]},
    marks: [
      Plot.ruleX([0]),
      Plot.ruleY(
        table,
        Plot.normalizeX("sum", {strokeWidth: 2, y: "height", x: "frequency", tip: {format: {y: ".2f"}}})
      )
    ]
  });
}
