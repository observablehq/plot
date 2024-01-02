import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function decimate100k() {
  const data = d3.cumsum({length: 99999} as unknown as Iterable<undefined>, d3.randomNormal.source(d3.randomLcg(42))());
  return Plot.plot({
    marks: [Plot.areaY(data, {fillOpacity: 0.15}), Plot.lineY(data)]
  });
}

export function decimateDifference() {
  const data = d3.cumsum({length: 99999} as unknown as Iterable<undefined>, d3.randomNormal.source(d3.randomLcg(42))());
  return Plot.differenceY(data).plot();
}

export function decimateCurve() {
  const A = d3.range(10).map((i) => [Math.sin((i * Math.PI) / 5), Math.cos((i * Math.PI) / 5)]);
  A.splice(2, 0, A[2].slice()), (A[2][1] += 0.4); // repeat one point and modify it
  return Plot.plot({
    inset: 20,
    grid: true,
    marks: [
      Plot.line(A, {
        curve: "catmull-rom-closed",
        marker: true,
        stroke: "orange"
      }),
      Plot.line(
        A,
        Plot.decimateX({
          curve: "catmull-rom-closed",
          marker: true,
          stroke: "steelblue",
          mixBlendMode: "multiply"
        })
      )
    ]
  });
}

export function decimateMonotone() {
  const C = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [1, -1],
    [2, -1]
  ];
  return Plot.plot({
    inset: 20,
    grid: true,
    marks: [
      Plot.line(C, {
        curve: "catmull-rom",
        marker: true,
        stroke: "orange"
      }),
      Plot.line(
        C,
        Plot.decimateX({
          curve: "catmull-rom",
          marker: true,
          stroke: "steelblue",
          mixBlendMode: "multiply"
        })
      )
    ]
  });
}

export async function decimateVariable() {
  const data = d3.cumsum({length: 12000} as unknown as Iterable<undefined>, d3.randomNormal.source(d3.randomLcg(42))());
  return Plot.plot({
    marginLeft: 60,
    grid: true,
    marks: [Plot.lineY(data, {x: (d, i) => i % 2000, stroke: (d, i) => i % 1000, z: (d, i) => Math.floor(i / 2000)})]
  });
}

export async function decimateZ() {
  const data = d3.cumsum({length: 12000} as unknown as Iterable<undefined>, d3.randomNormal.source(d3.randomLcg(42))());
  return Plot.plot({
    marginLeft: 60,
    grid: true,
    marks: [Plot.lineY(data, {x: (d, i) => i % 2000, stroke: (d, i) => "a" + Math.floor(i / 2000)})]
  });
}

export function decimatePixelSize() {
  const data = d3.cumsum({length: 99999} as unknown as Iterable<undefined>, d3.randomNormal.source(d3.randomLcg(42))());
  return Plot.lineY(data, {pixelSize: 20, curve: "natural", marker: true}).plot();
}
