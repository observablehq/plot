import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.valueof reads {length} objects", () => {
  const x = {length: 3};
  assert.deepStrictEqual(
    Plot.valueof(x, (_, i) => i),
    [0, 1, 2]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d),
    [undefined, undefined, undefined]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float32Array),
    Float32Array.of(NaN, NaN, NaN)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float64Array),
    Float64Array.of(NaN, NaN, NaN)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => `${d}`),
    ["undefined", "undefined", "undefined"]
  );
  assert.deepStrictEqual(Plot.valueof(x, ["a", "b", "c", "d"]), ["a", "b", "c", "d"]);
});

it("Plot.valueof reads iterables", () => {
  const x = new Set([1, 2, 3]);
  assert.deepStrictEqual(
    Plot.valueof(x, (_, i) => i),
    [0, 1, 2]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d),
    [1, 2, 3]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float32Array),
    Float32Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float64Array),
    Float64Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => `${d}`),
    ["1", "2", "3"]
  );
  assert.deepStrictEqual(Plot.valueof(x, ["a", "b", "c", "d"]), ["a", "b", "c", "d"]);
});

it("Plot.valueof reads arrays", () => {
  const x = [1, 2, 3];
  assert.deepStrictEqual(
    Plot.valueof(x, (_, i) => i),
    [0, 1, 2]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d),
    [1, 2, 3]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float32Array),
    Float32Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float64Array),
    Float64Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => `${d}`),
    ["1", "2", "3"]
  );
  assert.deepStrictEqual(Plot.valueof(x, ["a", "b", "c", "d"]), ["a", "b", "c", "d"]);
});

it("Plot.valueof reads typed arrays", () => {
  const x = Float32Array.of(1, 2, 3);
  assert.deepStrictEqual(
    Plot.valueof(x, (_, i) => i),
    [0, 1, 2]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d),
    [1, 2, 3]
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float32Array),
    Float32Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => d, Float64Array),
    Float64Array.of(1, 2, 3)
  );
  assert.deepStrictEqual(
    Plot.valueof(x, (d) => `${d}`),
    ["1", "2", "3"]
  );
  assert.deepStrictEqual(Plot.valueof(x, ["a", "b", "c", "d"]), ["a", "b", "c", "d"]);
});
