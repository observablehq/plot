import assert from "assert";
import {isNumericString, valueof} from "../src/options.js";

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

it("valueof returns nullish value", () => {
  assert.strictEqual(valueof([], null), null);
  assert.strictEqual(valueof([], undefined), undefined);
});

it("valueof returns the given field", () => {
  assert.deepStrictEqual(valueof([{a: 1}], "a"), [1]);
  assert.deepStrictEqual(valueof([{a: "b"}], "a"), ["b"]);
});

it("valueof returns the given transformed value", () => {
  assert.deepStrictEqual(valueof(null, {transform: () => ["a"]}), ["a"]);
  assert.deepStrictEqual(valueof("hello", {transform: (d) => [...d]}), ["h", "e", "l", "l", "o"]);
  assert.deepStrictEqual(valueof("1234", {transform: (d) => [...d]}, Float32Array), Float32Array.of(1, 2, 3, 4));
});

it("valueof returns typed arrays", () => {
  assert.ok(valueof([{a: 1}], "a", Float64Array) instanceof Float64Array);
  assert.ok(valueof([{a: 1}], "a", Uint8Array) instanceof Uint8Array);
  assert.ok(valueof([{a: 1}], "a", Array) instanceof Array);
  assert.ok(valueof([{a: 1}], "a") instanceof Array);
});
