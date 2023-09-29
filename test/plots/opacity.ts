import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

export function opacityDotsFillUnscaled() {
  return Plot.dotX(d3.ticks(0.3, 0.7, 40), {
    fill: "black",
    r: 7,
    fillOpacity: Plot.identity
  }).plot();
}

export function opacityDotsStrokeUnscaled() {
  return Plot.dotX(d3.ticks(0.3, 0.7, 40), {
    stroke: "black",
    r: 3.5,
    strokeWidth: 7,
    strokeOpacity: Plot.identity
  }).plot();
}

export function opacityDotsUnscaled() {
  return Plot.dotX(d3.ticks(0.3, 0.7, 40), {
    fill: "black",
    r: 7,
    opacity: Plot.identity
  }).plot();
}
