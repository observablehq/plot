import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

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

async function olympiansByWeight() {
  const olympians = await d3.csv<any>("data/athletes.csv", d3.autoType);
  return d3
    .bin()(olympians.map((d) => d.height))
    .map((bin) => ({weightclass: bin.x0, count: BigInt(bin.length)}));
}

export async function bigintNormalize() {
  return Plot.rectY(
    d3.sort(await olympiansByWeight(), (d) => -d.count),
    Plot.normalizeY({x: "weightclass", y: "count"})
  ).plot();
}

export async function bigintNormalizeMean() {
  return Plot.plot({
    x: {interval: 0.05},
    y: {label: "relative to mean"},
    marks: [
      Plot.barY(await olympiansByWeight(), Plot.normalizeY("mean", {x: "weightclass", y: "count"})),
      Plot.ruleY([1], {stroke: "red"})
    ]
  });
}
