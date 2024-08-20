import * as Plot from "@observablehq/plot";

export async function imageRenderSvgs() {
  return Plot.image([0], {
    frameAnchor: "middle",
    src: () => Plot.barX([1, 2, 3], {y: d => d}).plot(),
    width: 300,
    height: 200,
    imageRendering: "pixelated"
  }).plot({width: 300, height: 200});
}
