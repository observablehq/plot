import assert from "assert";
import {arrayify} from "../../src/options.js";

it("arrayify null, undefined", () => {
  for (const a of [null, undefined]) {
    assert.strictEqual(arrayify(a), a);
    assert.strictEqual(arrayify(a, Float32Array), a);
    assert.strictEqual(arrayify(a, Float64Array), a);
    assert.strictEqual(arrayify(a, Array), a);
  }
});

it("arrayify typed arrays", () => {
  const a = new Uint8ClampedArray(10);
  assert.strictEqual(arrayify(a), a);
  assert.strictEqual("" + arrayify(a, Float64Array), "" + a);
  assert.notStrictEqual(arrayify(a, Float64Array), a);
  assert.strictEqual(arrayify(a, Float64Array)[Symbol.toStringTag], "Float64Array");
  assert.strictEqual("" + arrayify(a, Array), "" + a);
  assert.notStrictEqual(arrayify(a, Array), a);
  assert.strictEqual(arrayify(a, Array)[Symbol.toStringTag], undefined);
});

it("arrayify arrays", () => {
  const a = [1, "test", 1.5];
  assert.strictEqual(arrayify(a), a);
  assert.strictEqual(arrayify(a, undefined), a);
  assert.strictEqual(arrayify(a, Array), a);
  assert.deepStrictEqual("" + arrayify(a, Float64Array), "" + [1, NaN, 1.5]);
  assert.deepStrictEqual("" + arrayify(a, Uint16Array), "" + [1, 0, 1]);
});
