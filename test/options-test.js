import assert from "assert";
import {identity, isNumericString, valueof} from "../src/options.js";

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

it("valueof returns the given accessor", () => {
  const a = (d) => d.a;
  assert.deepStrictEqual(valueof([{a: 1}], a), [1]);
  assert.deepStrictEqual(valueof([{a: "b"}], a), ["b"]);
});

it("valueof returns the given channel transform", () => {
  assert.deepStrictEqual(valueof(null, {transform: () => ["a"]}), ["a"]);
  assert.deepStrictEqual(valueof("hello", identity), ["h", "e", "l", "l", "o"]);
  assert.deepStrictEqual(valueof([..."1234"], identity), ["1", "2", "3", "4"]);
});

it("valueof returns arrays of the given type for fields", () => {
  assert.deepStrictEqual(valueof([{a: 1}], "a", Float64Array), Float64Array.of(1));
  assert.deepStrictEqual(valueof([{a: 1}], "a", Uint8Array), Uint8Array.of(1));
  assert.deepStrictEqual(valueof([{a: 1}], "a", Array), [1]);
});

it("valueof returns arrays of the given type for accessors", () => {
  const a = (d) => d.a;
  assert.deepStrictEqual(valueof([{a: 1}], a, Float64Array), Float64Array.of(1));
  assert.deepStrictEqual(valueof([{a: 1}], a, Uint8Array), Uint8Array.of(1));
  assert.deepStrictEqual(valueof([{a: 1}], a, Array), [1]);
});

it("valueof returns arrays of the given type for channel transforms", () => {
  assert.deepStrictEqual(valueof("1234", identity, Float32Array), Float32Array.of(1, 2, 3, 4));
  assert.deepStrictEqual(valueof("1234", identity, Uint8Array), Uint8Array.of(1, 2, 3, 4));
  assert.deepStrictEqual(valueof("1234", identity, Array), ["1", "2", "3", "4"]);
});

it("valueof performs safe coercion for float arrays", () => {
  class My64Array extends Float64Array {}
  class My32Array extends Float32Array {}
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, Float64Array), Float64Array.of(1, 2, 0, NaN, NaN));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, Float32Array), Float32Array.of(1, 2, 0, NaN, NaN));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, My64Array), My64Array.of(1, 2, 0, NaN, NaN));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, My32Array), My32Array.of(1, 2, 0, NaN, NaN));
});

it("valueof performs safe coercion for integer arrays", () => {
  class My32Array extends Uint32Array {}
  class My8Array extends Int8Array {}
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, Uint32Array), Uint32Array.of(1, 2, 0, 0, 0));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, Int16Array), Int16Array.of(1, 2, 0, 0, 0));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, My32Array), My32Array.of(1, 2, 0, 0, 0));
  assert.deepStrictEqual(valueof(["1", 2n, "", null, ,], identity, My8Array), My8Array.of(1, 2, 0, 0, 0));
});

it("valueof returns arrays that match the specified type as-is", () => {
  class My32Array extends Float32Array {}
  const a = ["1", 2n, "", null, ,];
  const f = Float64Array.of(1, 2, NaN);
  const m = My32Array.of(1, 2, NaN);
  assert.strictEqual(valueof(a, identity, Array), a);
  assert.strictEqual(valueof(f, identity, Float64Array), f);
  assert.strictEqual(valueof(m, identity, Float32Array), m);
  assert.strictEqual(valueof(m, identity, My32Array), m);
});
