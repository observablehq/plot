/* eslint-disable @typescript-eslint/ban-ts-comment */

import {it} from "vitest";
import {valueof} from "../src/options.js";

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
