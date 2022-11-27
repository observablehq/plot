import assert from "assert";
import {isNumericString} from "../src/options.js";

it("isNumericString detects numeric strings", () => {
  assert.strictEqual(isNumericString(["42"]), true);
});

it("isNumericString doesn’t consider numbers to be strings", () => {
  assert.strictEqual(isNumericString([42]), false);
  assert.strictEqual(isNumericString([NaN]), false);
});

it("isNumericString doesn’t consider the string NaN to be numeric", () => {
  assert.strictEqual(isNumericString(["NaN"]), false);
});

it("isNumericString ignores whitespace", () => {
  assert.strictEqual(isNumericString([" 42"]), true);
  assert.strictEqual(isNumericString(["42 "]), true);
  assert.strictEqual(isNumericString([" 42 "]), true);
});

it("isNumericString ignores null", () => {
  assert.strictEqual(isNumericString([null, "42", "notstring"]), true);
  assert.strictEqual(isNumericString([null, "notstring", "42"]), false);
});

it("isNumericString ignores undefined", () => {
  assert.strictEqual(isNumericString([undefined, "42", "notstring"]), true);
  assert.strictEqual(isNumericString([undefined, "notstring", "42"]), false);
});

it("isNumericString ignores empty strings", () => {
  assert.strictEqual(isNumericString(["", "42", "notstring"]), true);
  assert.strictEqual(isNumericString(["", "notstring", "42"]), false);
});

it("isNumericString ignores whitespace strings", () => {
  assert.strictEqual(isNumericString([" ", "42", "notstring"]), true);
  assert.strictEqual(isNumericString([" ", "notstring", "42"]), false);
});

it("isNumericString only checks the first present value", () => {
  assert.strictEqual(isNumericString(["42", "notstring"]), true);
  assert.strictEqual(isNumericString(["notstring", "42"]), false);
});
