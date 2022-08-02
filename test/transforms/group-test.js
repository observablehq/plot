import * as Plot from "@observablehq/plot";
import assert from "assert";

it("Plot.group does not return unspecified options", () => {
  const A = Plot.group({});
  assert.strictEqual("z" in A, false);
  assert.strictEqual("fill" in A, false);
  assert.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {fill: "red"});
  assert.strictEqual(B.fill, "red");
  assert.strictEqual("z" in B, false);
  assert.strictEqual("stroke" in B, false);
  const C = Plot.group({}, {stroke: "red"});
  assert.strictEqual(C.stroke, "red");
  assert.strictEqual("z" in C, false);
  assert.strictEqual("fill" in C, false);
  const D = Plot.group({}, {fill: "red", stroke: "x"});
  assert.strictEqual(D.fill, "red");
  assert.strictEqual(D.stroke.label, "x");
  assert.strictEqual("z" in D, false);
});

it("Plot.group does return specified options", () => {
  const A = Plot.group({}, {fill: null});
  assert.strictEqual(A.fill, null);
  assert.strictEqual("z" in A, false);
  assert.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {stroke: null});
  assert.strictEqual(B.stroke, null);
  assert.strictEqual("z" in B, false);
  assert.strictEqual("fill" in B, false);
  const C = Plot.group({}, {z: null});
  assert.strictEqual(C.z, null);
  assert.strictEqual("fill" in C, false);
  assert.strictEqual("stroke" in C, false);
});
