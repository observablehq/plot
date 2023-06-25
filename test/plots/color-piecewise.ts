import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function colorPiecewiseLinearDomain() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10, 20], range: ["red", "blue"]}
  });
}

export function colorPiecewiseLinearDomainReverse() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10, 20], reverse: true, range: ["red", "blue"]}
  });
}

export function colorPiecewiseLinearRange() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10], range: ["red", "blue", "green"]}
  });
}

export function colorPiecewiseLinearRangeHcl() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10], range: ["red", "blue", "green"], interpolate: "hcl"}
  });
}

export function colorPiecewiseLinearRangeReverse() {
  return Plot.cellX(d3.range(11), {fill: Plot.identity}).plot({
    color: {legend: true, type: "linear", domain: [0, 10], reverse: true, range: ["red", "blue", "green"]}
  });
}
