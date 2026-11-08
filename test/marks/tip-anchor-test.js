import "@observablehq/plot"; // load the entry first: mark.js and plot.js import each other
import {assert, it} from "vitest";
import {fitAnchor} from "../../src/marks/tip.js";

// Default pointerSize (12) and textPadding (8); a 100×40 text box in a 640×400
// plot, so the tip box (with padding) is 116×56.
function fit(x, y, {preferred = "bottom", width = 640, height = 400, w = 100, h = 40} = {}) {
  return fitAnchor(preferred, x, y, width, height, 12, 8, w, h);
}

it("fitAnchor uses the preferred anchor when it fits", () => {
  assert.strictEqual(fit(320, 200), "bottom");
  assert.strictEqual(fit(320, 200, {preferred: "left"}), "left");
  assert.strictEqual(fit(320, 200, {preferred: "top-right"}), "top-right");
});

it("fitAnchor uses the preferred anchor near an edge, as long as it fits", () => {
  assert.strictEqual(fit(560, 200), "bottom"); // the box spans [502, 618]
});

it("fitAnchor moves the tip away from the left and right edges", () => {
  assert.strictEqual(fit(600, 200), "right");
  assert.strictEqual(fit(40, 200), "left");
});

it("fitAnchor moves the tip away from the top and bottom edges", () => {
  assert.strictEqual(fit(320, 20), "top");
  assert.strictEqual(fit(320, 390, {preferred: "top"}), "bottom");
});

it("fitAnchor uses a corner anchor near a corner", () => {
  assert.strictEqual(fit(600, 20), "top-right");
  assert.strictEqual(fit(40, 390), "bottom-left");
});

it("fitAnchor counts the vertical extent of side anchors", () => {
  // A 116×76 tip at (10, 20) in a 640×100 plot: the left anchor (centered
  // vertically) overflows the top by 18px; the top-left anchor overflows the
  // bottom by 2px.
  assert.strictEqual(fit(10, 20, {height: 100, h: 60}), "top-left");
});

it("fitAnchor picks the anchor that overflows the least when none fits", () => {
  // A 216×36 tip in a 100×100 plot overflows horizontally whatever the anchor;
  // centered anchors overflow the least, and the preferred one wins the tie.
  assert.strictEqual(fit(50, 50, {width: 100, height: 100, w: 200, h: 20}), "bottom");
  assert.strictEqual(fit(50, 50, {width: 100, height: 100, w: 200, h: 20, preferred: "top"}), "top");
});

it("fitAnchor falls back to the default order when there is no preferred anchor", () => {
  assert.strictEqual(fit(320, 200, {preferred: null}), "bottom");
  assert.strictEqual(fit(320, 20, {preferred: null}), "top");
});
