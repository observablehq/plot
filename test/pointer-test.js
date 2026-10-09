// @vitest-environment node

import * as Plot from "@observablehq/plot";
import {JSDOM} from "jsdom";
import {afterEach, assert, beforeEach, describe, it} from "vitest";

function setup() {
  const jsdom = new JSDOM("");
  const window = jsdom.window;
  global.window = window;
  global.document = window.document;
  global.Event = window.Event;
  global.Node = window.Node;
  global.NodeList = window.NodeList;
  global.HTMLCollection = window.HTMLCollection;
  window.SVGElement.prototype.getBBox = () => ({x: 0, y: 0, width: 100, height: 20});

  const rafQueue = [];
  global.requestAnimationFrame = (fn) => rafQueue.push(fn);
  global.cancelAnimationFrame = (id) => (rafQueue[id - 1] = null);

  function flushAnimationFrame() {
    let q;
    while ((q = rafQueue.splice(0)).length) q.forEach((fn) => fn?.());
  }

  function pointer(svg, type, x, y) {
    const e = new window.Event(type, {bubbles: true});
    e.clientX = x;
    e.clientY = y;
    e.pointerType = "mouse";
    svg.dispatchEvent(e);
  }

  return {pointer, flushAnimationFrame};
}

function teardown() {
  delete global.window;
  delete global.document;
  delete global.Event;
  delete global.Node;
  delete global.NodeList;
  delete global.HTMLCollection;
  delete global.requestAnimationFrame;
  delete global.cancelAnimationFrame;
}

function visibleTips(svg) {
  return [...svg.querySelectorAll("[aria-label=tip]")].filter((g) => g.querySelector("text")).length;
}

describe("pointer pool", () => {
  let pointer, flushAnimationFrame;

  beforeEach(() => ({pointer, flushAnimationFrame} = setup()));
  afterEach(teardown);

  it("multiple tip: true marks show only one tip", () => {
    const svg = Plot.plot({
      marks: [
        Plot.dot([{x: 1, y: 1}, {x: 2, y: 2}], {x: "x", y: "y", tip: true}), // prettier-ignore
        Plot.dot([{x: 1.1, y: 1.1}, {x: 2.1, y: 2.1}], {x: "x", y: "y", tip: true}) // prettier-ignore
      ]
    });
    pointer(svg, "pointerenter", 40, 370);
    pointer(svg, "pointermove", 40, 370);
    flushAnimationFrame();
    assert.strictEqual(visibleTips(svg), 1);
  });

  it("compound marks with tip: true show only one tip", () => {
    const svg = Plot.boxX([1, 2, 3, 4, 5, 10, 20], {tip: true}).plot();
    const tips = svg.querySelectorAll("[aria-label=tip]");
    assert.ok(tips.length > 1, "boxX should create multiple tip marks");
    pointer(svg, "pointerenter", 100, 15);
    pointer(svg, "pointermove", 100, 15);
    flushAnimationFrame();
    assert.strictEqual(visibleTips(svg), 1);
  });

  it("crosshair renders all sub-marks (does not pool)", () => {
    const svg = Plot.plot({
      marks: [Plot.crosshair([{x: 1, y: 1}, {x: 2, y: 2}], {x: "x", y: "y"})] // prettier-ignore
    });
    pointer(svg, "pointerenter", 40, 370);
    pointer(svg, "pointermove", 40, 370);
    flushAnimationFrame();
    // crosshair creates 4 sub-marks (ruleX, ruleY, textX, textY);
    // all should render independently since they don't pool
    const rules = svg.querySelectorAll("[aria-label^='crosshair']");
    assert.ok(rules.length >= 2, "crosshair should have at least 2 sub-marks rendered");
  });

  it("crosshair and tip: true coexist", () => {
    const svg = Plot.plot({
      marks: [
        Plot.dot([{x: 1, y: 1}, {x: 2, y: 2}], {x: "x", y: "y", tip: true}), // prettier-ignore
        Plot.crosshair(
          [
            {x: 1, y: 1},
            {x: 2, y: 2}
          ],
          {x: "x", y: "y"}
        )
      ]
    });
    pointer(svg, "pointerenter", 40, 370);
    pointer(svg, "pointermove", 40, 370);
    flushAnimationFrame();
    // The tip should render (1 from the dot's tip: true)
    assert.strictEqual(visibleTips(svg), 1);
    // The crosshair sub-marks should also render
    const crosshairMarks = svg.querySelectorAll("[aria-label^='crosshair']");
    assert.ok(crosshairMarks.length >= 2, "crosshair sub-marks should also render");
  });

  it("explicit tip(pointer) pools with tip: true", () => {
    const data = [{x: 1, y: 1}, {x: 2, y: 2}]; // prettier-ignore
    const svg = Plot.plot({
      marks: [Plot.dot(data, {x: "x", y: "y", tip: true}), Plot.tip(data, Plot.pointer({x: "x", y: "y", pool: true}))]
    });
    pointer(svg, "pointerenter", 40, 370);
    pointer(svg, "pointermove", 40, 370);
    flushAnimationFrame();
    assert.strictEqual(visibleTips(svg), 1);
  });

  it("pointerleave hides all tips", () => {
    const svg = Plot.plot({
      marks: [
        Plot.dot([{x: 1, y: 1}, {x: 2, y: 2}], {x: "x", y: "y", tip: true}), // prettier-ignore
        Plot.dot([{x: 1.1, y: 1.1}, {x: 2.1, y: 2.1}], {x: "x", y: "y", tip: true}) // prettier-ignore
      ]
    });
    pointer(svg, "pointerenter", 40, 370);
    pointer(svg, "pointermove", 40, 370);
    flushAnimationFrame();
    assert.strictEqual(visibleTips(svg), 1);
    pointer(svg, "pointerleave", 0, 0);
    flushAnimationFrame();
    assert.strictEqual(visibleTips(svg), 0);
  });
});

describe("pointer value", () => {
  let pointer, flushAnimationFrame;

  beforeEach(() => ({pointer, flushAnimationFrame} = setup()));
  afterEach(teardown);

  it("falls back to another active pointer when one pointer clears", () => {
    // A pointerY with an infinite radius stays active anywhere in the frame,
    // while the dot’s tip is only active near the dot.
    const svg = Plot.plot({
      marks: [
        Plot.frame(),
        Plot.rect(["foo"], Plot.pointerY({y: (d) => d, maxRadius: Infinity, fill: "orange"})),
        Plot.dot([{y: "foo"}], {y: "y", tip: true})
      ]
    });
    pointer(svg, "pointerenter", 50, 40);
    pointer(svg, "pointermove", 50, 40);
    flushAnimationFrame();
    assert.strictEqual(svg.value, "foo");
    pointer(svg, "pointermove", 340, 40);
    flushAnimationFrame();
    assert.deepStrictEqual(svg.value, {y: "foo"});
    pointer(svg, "pointermove", 50, 40);
    flushAnimationFrame();
    assert.strictEqual(svg.value, "foo");
    pointer(svg, "pointerleave", 0, 0);
    flushAnimationFrame();
    assert.strictEqual(svg.value, null);
  });

  it("keeps the pooled winner’s value when the other pooled tips clear", () => {
    const svg = Plot.plot({
      marks: [
        Plot.dot([{x: 0, y: "foo"}], {x: "x", y: "y", tip: {maxRadius: 1000}}),
        Plot.dot([{x: 1, y: "foo"}], {x: "x", y: "y", tip: {maxRadius: 1000}})
      ]
    });
    pointer(svg, "pointerenter", 50, 40);
    pointer(svg, "pointermove", 50, 40);
    flushAnimationFrame();
    assert.deepStrictEqual(svg.value, {x: 0, y: "foo"});
    pointer(svg, "pointermove", 620, 40);
    flushAnimationFrame();
    assert.deepStrictEqual(svg.value, {x: 1, y: "foo"});
    pointer(svg, "pointermove", 50, 40);
    flushAnimationFrame();
    assert.deepStrictEqual(svg.value, {x: 0, y: "foo"});
    assert.strictEqual(visibleTips(svg), 1);
  });
});
