import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function imagePixelated() {
  return Plot.image([0], {
    frameAnchor: "middle",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdjVBaX/s/TdotBLrqfgfHeXaP/Ek3PGGatfcEAAHifCmZc3SIiAAAAAElFTkSuQmCC",
    width: 300,
    height: 200,
    imageRendering: "pixelated"
  }).plot({width: 300, height: 200});
});
