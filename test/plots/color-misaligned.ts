import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function warnMisalignedDivergingDomain() {
  return Plot.cellX(d3.range(-5, 6), {x: Plot.identity, fill: Plot.identity}).plot({
    color: {legend: true, type: "diverging", domain: [-5, 5, 10]}
  });
}

export function warnMisalignedLinearDomain() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10, 20], range: ["red", "blue"]}
  });
}

export function warnMisalignedLinearDomainReverse() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10, 20], reverse: true, range: ["red", "blue"]}
  });
}

export function warnMisalignedLinearRange() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10], range: ["red", "blue", "green"]}
  });
}

export function warnMisalignedLinearRangeReverse() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10], reverse: true, range: ["red", "blue", "green"]}
  });
}
