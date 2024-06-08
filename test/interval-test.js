import assert from "assert";
import {numberInterval} from "../src/options.js";

describe("numberInterval(interval)", () => {
  it("coerces the given interval to a number", () => {
    assert.deepStrictEqual(numberInterval("1").range(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it("implements range", () => {
    assert.deepStrictEqual(numberInterval(1).range(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.deepStrictEqual(numberInterval(1).range(1, 9), [1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it("implements floor", () => {
    assert.strictEqual(numberInterval(1).floor(9.9), 9);
    assert.strictEqual(numberInterval(2).floor(9), 8);
  });
  it("implements offset", () => {
    assert.strictEqual(numberInterval(1).offset(8), 9);
    assert.strictEqual(numberInterval(2).offset(8), 10);
  });
  it("implements offset with step", () => {
    assert.strictEqual(numberInterval(1).offset(8, 2), 10);
    assert.strictEqual(numberInterval(2).offset(8, 2), 12);
  });
  it("does not require an aligned offset", () => {
    assert.strictEqual(numberInterval(2).offset(7), 9);
  });
  it("floors the offset step", () => {
    assert.strictEqual(numberInterval(1).offset(8, 2.5), 10);
    assert.strictEqual(numberInterval(2).offset(8, 2.5), 12);
  });
  it("coerces the offset step", () => {
    assert.strictEqual(numberInterval(1).offset(8, "2.5"), 10);
    assert.strictEqual(numberInterval(2).offset(8, "2.5"), 12);
  });
  it("accepts positive integers", () => {
    assert.deepStrictEqual(numberInterval(2).range(0, 10), [0, 2, 4, 6, 8]);
  });
  it("accepts negative integers", () => {
    assert.deepStrictEqual(numberInterval(-2).range(0, 5), [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);
  });
  it("does not require an aligned range", () => {
    assert.deepStrictEqual(numberInterval(2).range(1, 9), [2, 4, 6, 8]);
  });
});
