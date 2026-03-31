import * as Plot from "@observablehq/plot";

if (import.meta.vitest) {
  await import("../plot.js").then((_) => _.declareTests(import.meta.filename));
}

export async function imagePixelated() {
  return Plot.image([0], {
    frameAnchor: "middle",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdjVBaX/s/TdotBLrqfgfHeXaP/Ek3PGGatfcEAAHifCmZc3SIiAAAAAElFTkSuQmCC",
    width: 300,
    height: 200,
    imageRendering: "pixelated"
  }).plot({width: 300, height: 200});
}
