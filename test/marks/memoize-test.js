import {memoize1} from "../../src/memoize.js";
import assert from "assert";

describe("memoize1(compute)", () => {
  it("returns the cached value with repeated calls", () => {
    let index = 0;
    const m = memoize1(() => ++index);
    assert.strictEqual(m(), 1);
    assert.strictEqual(m(), 1);
    assert.strictEqual(m(), 1);
    assert.strictEqual(m(0), 2);
    assert.strictEqual(m(0), 2);
    assert.strictEqual(m(0), 2);
  });

  it("works with a single-argument function", () => {
    let index = 0;
    const m = memoize1((arg) => [arg, ++index]);
    assert.deepStrictEqual(m(), [undefined, 1]);
    assert.deepStrictEqual(m(), [undefined, 1]);
    assert.deepStrictEqual(m(undefined), [undefined, 1]);
    assert.deepStrictEqual(m(undefined), [undefined, 1]);
    assert.deepStrictEqual(m(null), [null, 2]);
    assert.deepStrictEqual(m(null), [null, 2]);
    assert.deepStrictEqual(m(undefined), [undefined, 3]);
    assert.deepStrictEqual(m(undefined), [undefined, 3]);
    assert.deepStrictEqual(m(NaN), [NaN, 4]);
    assert.deepStrictEqual(m(NaN), [NaN, 4]);
  });

  it("computes a new value with a different argument value", () => {
    let index = 0;
    const m = memoize1(() => ++index);
    assert.strictEqual(m(), 1);
    assert.strictEqual(m(0), 2);
    assert.strictEqual(m(undefined), 3);
    assert.strictEqual(m(null), 4);
    assert.strictEqual(m(0), 5);
    assert.strictEqual(m(0, 1), 6);
    assert.strictEqual(m(0, 2), 7);
  });

  it("computes a new value with different number of arguments", () => {
    let index = 0;
    const m = memoize1(() => ++index);
    assert.strictEqual(m(0), 1);
    assert.strictEqual(m(0, 0), 2);
    assert.strictEqual(m(0, 0, 0), 3);
    assert.strictEqual(m(0, 0), 4);
    assert.strictEqual(m(0), 5);
  });

  it("only caches a single value", () => {
    let index = 0;
    const m = memoize1(() => ++index);
    assert.strictEqual(m(0), 1);
    assert.strictEqual(m(1), 2);
    assert.strictEqual(m(1), 2);
    assert.strictEqual(m(0), 3);
    assert.strictEqual(m(0), 3);
    assert.strictEqual(m(1), 4);
    assert.strictEqual(m(1), 4);
  });

  it("determines equality with strict equals", () => {
    let index = 0;
    const m = memoize1(() => ++index);
    assert.strictEqual(m([0]), 1);
    assert.strictEqual(m([1]), 2);
    assert.strictEqual(m([1]), 3);
    assert.strictEqual(m([0]), 4);
    assert.strictEqual(m([0]), 5);
    assert.strictEqual(m([1]), 6);
    assert.strictEqual(m([1]), 7);
  });

  it("passes the specified arguments to compute", () => {
    let index = 0;
    const m = memoize1((...args) => [...args, ++index]);
    assert.deepStrictEqual(m(0), [0, 1]);
    assert.deepStrictEqual(m(1), [1, 2]);
    assert.deepStrictEqual(m(1), [1, 2]);
    assert.deepStrictEqual(m(0, 1), [0, 1, 3]);
    assert.deepStrictEqual(m(0, 1), [0, 1, 3]);
    assert.deepStrictEqual(m(1, 0), [1, 0, 4]);
    assert.deepStrictEqual(m(1, 0), [1, 0, 4]);
    assert.deepStrictEqual(m(1, NaN), [1, NaN, 5]);
    assert.deepStrictEqual(m(1, NaN), [1, NaN, 5]);
  });
});
