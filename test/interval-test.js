import assert from "assert";
import {numberInterval} from "../src/options.js";

describe("numberInterval(interval)", () => {
  it("coerces the given interval to a number", () => {
    assert.deepStrictEqual(numberInterval("1").range(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("implements range", () => {
    assert.deepStrictEqual(numberInterval(1).range(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepStrictEqual(numberInterval(1).range(1, 9), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.deepStrictEqual(numberInterval(2).range(1, 9), [2, 4, 6, 8]);
    assert.deepStrictEqual(numberInterval(-1).range(2, 5), [2, 3, 4]);
    assert.deepStrictEqual(numberInterval(-2).range(2, 5), [2, 2.5, 3, 3.5, 4, 4.5]);
    assert.deepStrictEqual(numberInterval(2).range(0, 10), [0, 2, 4, 6, 8]);
    assert.deepStrictEqual(numberInterval(-2).range(0, 5), [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);
  });
  it("considers descending ranges to be empty", () => {
    assert.deepStrictEqual(numberInterval(1).range(10, 0), []);
    assert.deepStrictEqual(numberInterval(1).range(-1, -9), []);
  });
  it("considers invalid ranges to be empty", () => {
    assert.deepStrictEqual(numberInterval(1).range(0, Infinity), []);
    assert.deepStrictEqual(numberInterval(1).range(NaN, 0), []);
  });
  it("considers invalid intervals to be empty", () => {
    assert.deepStrictEqual(numberInterval(NaN).range(0, 10), []);
    assert.deepStrictEqual(numberInterval(-Infinity).range(0, 10), []);
    assert.deepStrictEqual(numberInterval(0).range(0, 10), []);
  });
  it("implements floor", () => {
    assert.strictEqual(numberInterval(1).floor(9.9), 9);
    assert.strictEqual(numberInterval(2).floor(9), 8);
    assert.strictEqual(numberInterval(-2).floor(8.6), 8.5);
  });
  it("implements offset", () => {
    assert.strictEqual(numberInterval(1).offset(8), 9);
    assert.strictEqual(numberInterval(2).offset(8), 10);
    assert.strictEqual(numberInterval(-2).offset(8), 8.5);
  });
  it("implements offset with step", () => {
    assert.strictEqual(numberInterval(1).offset(8, 2), 10);
    assert.strictEqual(numberInterval(2).offset(8, 2), 12);
    assert.strictEqual(numberInterval(-2).offset(8, 2), 9);
  });
  it("does not require an aligned offset", () => {
    assert.strictEqual(numberInterval(2).offset(7), 9);
    assert.strictEqual(numberInterval(-2).offset(7.1), 7.6);
  });
  it("floors the offset step", () => {
    assert.strictEqual(numberInterval(1).offset(8, 2.5), 10);
    assert.strictEqual(numberInterval(2).offset(8, 2.5), 12);
    assert.strictEqual(numberInterval(-2).offset(8, 2.5), 9);
  });
  it("coerces the offset step", () => {
    assert.strictEqual(numberInterval(1).offset(8, "2.5"), 10);
    assert.strictEqual(numberInterval(2).offset(8, "2.5"), 12);
    assert.strictEqual(numberInterval(-2).offset(8, "2.5"), 9);
  });
  it("allows a negative offset step", () => {
    assert.strictEqual(numberInterval(1).offset(8, -2), 6);
    assert.strictEqual(numberInterval(2).offset(8, -2), 4);
    assert.strictEqual(numberInterval(-2).offset(8, -2), 7);
  });
});
