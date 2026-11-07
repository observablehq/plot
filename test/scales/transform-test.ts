import * as Plot from "@observablehq/plot";
import {assert, it} from "vitest";

function cx(plot: SVGSVGElement | HTMLElement): (string | null)[] {
  return Array.from(plot.querySelectorAll("circle"), (circle) => circle.getAttribute("cx"));
}

it("a null scale transform disables the transform implied by the interval option", () => {
  const data = [1.5, 2.5, 3.5];
  const plain = cx(Plot.dotX(data).plot({x: {domain: [0, 4]}}));
  const interval = cx(Plot.dotX(data).plot({x: {domain: [0, 4], interval: 1}}));
  const intervalNull = cx(Plot.dotX(data).plot({x: {domain: [0, 4], interval: 1, transform: null}}));
  assert.notDeepEqual(interval, plain);
  assert.deepEqual(intervalNull, plain);
});

it("a null scale transform disables the transform implied by the percent option", () => {
  const data = [0.25, 0.5, 0.75];
  const plain = cx(Plot.dotX(data).plot({x: {domain: [0, 1]}}));
  const percentNull = cx(Plot.dotX(data).plot({x: {domain: [0, 1], percent: true, transform: null}}));
  assert.deepEqual(percentNull, plain);
});
