import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";
const {window} = new JSDOM("");
global.document = window.document;
global.Node = window.Node;

it("legendColor shows swatches", () => {
  const A = Plot.legendColor({ type: "diverging", domain: [-1, 1] });
  assert.strictEqual(A.outerHTML, `<svg width="240" height="50" viewBox="0,0,240,50" style="overflow: visible; display: block;"><image x="0" y="18" width="240" height="10" preserveAspectRatio="none" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAABmJLR0QA/wD/AP+gvaeTAAAA2ElEQVQ4jXWLwZEDMAgDV1BIykv/BRjuYWxjz+XBSFoJffmkC1ziVfvJhduzsfK2emHFzFp+Tr68YS5kwnzm1cl7N7nc9mb3bsjs2pw8vZr/xaf6lbmyI+vMoTjWsjm0Hjt/mCEdPtVA7VeLTc21VzsTyMjGUgJKdxYpkRhIJCJh6puT44FYOSFeTQjy+My9X/4/HbFyY+VHHL78aD+bBcVz85UvFmy293F29/buo/Xx8H3V5cMzk4jYfGqQ2XwkGVF97IuMK89NkDEql45R3Xi6ftWPlw/+AP61XqZckQ8kAAAAAElFTkSuQmCC"></image><g transform="translate(0,28)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle"><g class="tick" opacity="1" transform="translate(0.5,0)"><line stroke="currentColor" y2="6" y1="-10"></line><text fill="currentColor" y="9" dy="0.71em">−1.0</text></g><g class="tick" opacity="1" transform="translate(60.5,0)"><line stroke="currentColor" y2="6" y1="-10"></line><text fill="currentColor" y="9" dy="0.71em">−0.5</text></g><g class="tick" opacity="1" transform="translate(120.5,0)"><line stroke="currentColor" y2="6" y1="-10"></line><text fill="currentColor" y="9" dy="0.71em">0.0</text></g><g class="tick" opacity="1" transform="translate(180.5,0)"><line stroke="currentColor" y2="6" y1="-10"></line><text fill="currentColor" y="9" dy="0.71em">0.5</text></g><g class="tick" opacity="1" transform="translate(240.5,0)"><line stroke="currentColor" y2="6" y1="-10"></line><text fill="currentColor" y="9" dy="0.71em">1.0</text></g></g></svg>`);
});

it("legendColor accepts a scale definition", () => {
  const color = {};
  assert(Plot.legendColor(color).outerHTML.match(/^<svg/));
});

it("legendColor accepts a plot", () => {
  const plot = Plot.cellX([1,2]).plot();
  assert(Plot.legendColor(plot).outerHTML.match(/^<svg/));
});

it("legendColor accepts a plot with no color", () => {
  const plot = Plot.dotX([1,2]).plot();
  assert.strictEqual(Plot.legendColor(plot), undefined);
});
