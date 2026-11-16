/* eslint-disable @typescript-eslint/ban-ts-comment */

import {it} from "vitest";
import {valueof} from "../src/options.js";
import * as Plot from "../src/index.js";

it("a function is not a valid input data", () => {
  // @ts-expect-error
  valueof(() => {}, "field");
});

it("a Promise is not a valid input data", () => {
  // @ts-expect-error
  valueof(new Promise(() => {}), "field");
});

it("a symbol is not a valid value", () => {
  // @ts-expect-error
  valueof(null, Symbol("field"));
});

it("a bigint is not a valid value", () => {
  // @ts-expect-error
  valueof(null, 2n);
});

it("tip options do not allow nested tips", () => {
  // @ts-expect-error tips cannot create another tip
  Plot.dot([1, 2], {tip: {tip: {}}});
  // @ts-expect-error the tip mark ignores its own tip option
  Plot.tip([1, 2], {tip: true});
  // @ts-expect-error the Tip constructor has the same options as the factory
  new Plot.Tip([1, 2], {tip: {}});
});

it("tip options retain shared mark and text styling", () => {
  Plot.dot([1, 2], {tip: {anchor: "top", fill: "white", fontSize: 14, textPadding: 4}});
  Plot.dot([1, 2], {tip: true});
  Plot.tip([1, 2], {anchor: "top", fill: "white", fontSize: 14, textPadding: 4});
  new Plot.Tip([1, 2], {frameAnchor: "top", format: ".1f"});
});
