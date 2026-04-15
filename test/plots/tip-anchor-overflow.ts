import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function tipAnchorOverflow() {
  const plot = Plot.rectX([1, 1, 1, 1, 1], {
    x: Plot.identity,
    fill: Plot.indexOf,
    title: () =>
      "Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum",
    tip: true
  }).plot({height: 80, marginTop: 20, axis: null});
  plot.dispatchEvent(
    new PointerEvent("pointermove", {
      pointerType: "mouse",
      clientX: 580,
      clientY: 30
    })
  );
  return Object.assign(plot, {ready: new Promise((resolve) => setTimeout(resolve, 100))});
});
