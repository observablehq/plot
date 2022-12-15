import * as Plot from "@observablehq/plot";

export default async function () {
  const k = 10;
  const m = Math.ceil((640 - 60) / k);
  const n = Math.ceil((400 - 50) / k);
  return Plot.plot({
    marks: [
      Plot.pixel(
        {length: n * m},
        {
          pixelRatio: 1 / k,
          x: (d, i) => i % m,
          y: (d, i) => Math.floor(i / m),
          fill: (d, i) => ((i % m & 1) === (Math.floor(i / m) & 1) ? true : i % m & 1 ? null : undefined)
        }
      )
    ]
  });
}
