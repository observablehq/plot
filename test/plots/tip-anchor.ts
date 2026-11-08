import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

// Test tip anchor selection near the right edge of the chart.
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

// Test tip anchor selection near the bottom edge of the chart.
test(async function tipAnchorOverflowY() {
  const plot = Plot.rectY([1, 1, 1, 1, 1], {
    y: Plot.identity,
    fill: Plot.indexOf,
    title: () =>
      "Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum",
    tip: {lineWidth: 5}
  }).plot({width: 80, marginLeft: 20, axis: null});
  plot.dispatchEvent(
    new PointerEvent("pointermove", {
      pointerType: "mouse",
      clientX: 30,
      clientY: 20
    })
  );
  return Object.assign(plot, {ready: new Promise((resolve) => setTimeout(resolve, 100))});
});

// Test tip anchor selection at all 9 positions across the chart.
test(async function tipAnchorPositions() {
  const data = [];
  for (const px of [40, 320, 600]) {
    for (const py of [20, 100, 180]) {
      data.push({px, py});
    }
  }
  const plot = Plot.plot({
    width: 640,
    height: 200,
    axis: null,
    inset: 20,
    marks: [
      Plot.dot(data, {x: "px", y: "py", r: 5, fill: "currentColor"}),
      Plot.tip(data, {
        x: "px",
        y: "py",
        title: () => "A tip that is wide enough to test anchor fitting behavior across positions"
      })
    ]
  });
  // Dispatch a pointer event to trigger all tips
  for (const {px, py} of data) {
    plot.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerType: "mouse",
        clientX: px,
        clientY: py
      })
    );
  }
  return Object.assign(plot, {ready: new Promise((resolve) => setTimeout(resolve, 100))});
});
