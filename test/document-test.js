import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";

it("Plot.plot supports the document option", () => {
  const {window} = new JSDOM("");
  const svg = Plot.plot({document: window.document, marks: [Plot.barY([1, 2, 4, 3])]});
  assert.strictEqual(svg.ownerDocument, window.document);
});

it("Plot.plot supports the document option for inline legends", () => {
  const {window} = new JSDOM("");
  const figure = Plot.plot({document: window.document, color: {legend: true}, marks: [Plot.cellX([1, 2, 4, 3])]});
  assert.strictEqual(figure.ownerDocument, window.document);
});

it("mark.plot supports the document option", () => {
  const {window} = new JSDOM("");
  const svg = Plot.barY([1, 2, 4, 3]).plot({document: window.document});
  assert.strictEqual(svg.ownerDocument, window.document);
});

it("Plot.legend supports the document option", () => {
  const {window} = new JSDOM("");
  const svg = Plot.legend({document: window.document, color: {type: "linear"}});
  assert.strictEqual(svg.ownerDocument, window.document);
});

it("plot.legend supports the document option for quantitative color scales", () => {
  const {window: window1} = new JSDOM("");
  const {window: window2} = new JSDOM("");
  const svg = Plot.plot({document: window1.document, marks: [Plot.cellX([1, 2, 4, 3])]}).legend("color", {
    document: window2.document
  });
  assert.strictEqual(svg.ownerDocument, window2.document);
});

it("plot.legend inherits the document option", () => {
  const {window} = new JSDOM("");
  const svg = Plot.plot({document: window.document, marks: [Plot.cellX([1, 2, 4, 3])]}).legend("color");
  assert.strictEqual(svg.ownerDocument, window.document);
});

it("plot.legend inherits the document option if that option is present but undefined", () => {
  const {window} = new JSDOM("");
  const svg = Plot.plot({document: window.document, marks: [Plot.cellX([1, 2, 4, 3])]}).legend("color", {
    document: undefined
  });
  assert.strictEqual(svg.ownerDocument, window.document);
});

it("plot.legend supports the document option for categorical color scales", () => {
  const {window} = new JSDOM("");
  const svg = Plot.plot({
    document: window.document,
    color: {type: "categorical"},
    marks: [Plot.cellX([1, 2, 4, 3])]
  }).legend("color");
  assert.strictEqual(svg.ownerDocument, window.document);
});
