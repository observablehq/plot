import {assert, it} from "vitest";
import {identity, isNumericString, valueof} from "../src/options.js";
import {isYearInteger, isYearIntegers} from "../src/options.js";

it("isYearInteger returns true for integers in [1500, 2500]", () => {
  assert.strictEqual(isYearInteger(1500), true);
  assert.strictEqual(isYearInteger(1999), true);
  assert.strictEqual(isYearInteger(2000), true);
  assert.strictEqual(isYearInteger(2001), true);
  assert.strictEqual(isYearInteger(2500), true);
});

it("isYearInteger returns false for non-integers, or numbers outside [1500, 2500]", () => {
  assert.strictEqual(isYearInteger(-2000), false);
  assert.strictEqual(isYearInteger(-1500), false);
  assert.strictEqual(isYearInteger(0), false);
  assert.strictEqual(isYearInteger("1000"), false);
  assert.strictEqual(isYearInteger(null), false);
  assert.strictEqual(isYearInteger(2000.5), false);
  assert.strictEqual(isYearInteger(NaN), false);
  assert.strictEqual(isYearInteger(undefined), false);
});

it("isYearIntegers requires every value to be a year integer", () => {
  assert.strictEqual(isYearIntegers([]), undefined);
  assert.strictEqual(isYearIntegers([1]), false);
  assert.strictEqual(isYearIntegers([2000]), true);
  assert.strictEqual(isYearIntegers([2000, 1]), false);
  assert.strictEqual(isYearIntegers([2000, "2000"]), false);
  assert.strictEqual(isYearIntegers([2000, 1999]), true);
});

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

it("valueof returns the given array value", () => {
  const a = [1, 2, 3];
  assert.strictEqual(valueof(null, a), a);
  assert.strictEqual(valueof(undefined, a), a);
  assert.strictEqual(valueof([], a), a);
});

it("valueof accepts complicated data with the proper accessor", () => {
  const m = [(d) => d, new Promise(() => {})];
  assert.deepStrictEqual(valueof(m, String), ["(d) => d", "[object Promise]"]);
});

it("data passed to valueof can be nullish and generated by the transform method", () => {
  assert.deepStrictEqual(valueof(undefined, {transform: () => [1, "text"]}), [1, "text"]);
  assert.deepStrictEqual(valueof(null, {transform: () => [1, "text"]}, Float32Array), Float32Array.of(1, NaN));
  assert.deepStrictEqual(valueof(null, {transform: () => new Float64Array(2)}, Array), [0, 0]);
});

it("valueof does not crash on nullish data with an accessor", () => {
  const a = () => 1;
  assert.strictEqual(valueof(null, a), null);
  assert.strictEqual(valueof(undefined, a), undefined);
  assert.deepStrictEqual(valueof(0, a), []); // ill-defined, but not crashing
});
