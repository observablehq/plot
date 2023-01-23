import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// https://observablehq.com/@fil/pseudoblue
const d = 1 / 307;
const mix = (x, y) => ((x * 212281 + y * 384817) & 0x5555555) * d;
const s = 8;
let a, b;
function random(x, y, z = 0) {
  x += 43 * z;
  y += 53 * z;
  let v = 0;
  for (let i = 0; i < s; ++i) {
    b = y;
    a = 1 & (x ^ mix((x >>= 1), (y >>= 1)));
    b = 1 & (b ^ mix(y, x));
    v = (v << 2) | (a + (b << 1) + 1) % 4;
  }
  return v / (1 << (s << 1));
}

export async function rasterPenguinsPseudoblue() {
  const interpolate = Plot.interpolatorBarycentric({random});
  const penguins = await d3.csv("data/penguins.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.raster(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", interpolate}),
      Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", fill: "island", stroke: "white"})
    ]
  });
}
