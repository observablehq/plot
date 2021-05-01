import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("Plot.group does not return unspecified options", test => {
  const A = Plot.group({});
  test.strictEqual("z" in A, false);
  test.strictEqual("fill" in A, false);
  test.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {fill: "red"});
  test.strictEqual(B.fill, "red");
  test.strictEqual("z" in B, false);
  test.strictEqual("stroke" in B, false);
  const C = Plot.group({}, {stroke: "red"});
  test.strictEqual(C.stroke, "red");
  test.strictEqual("z" in C, false);
  test.strictEqual("fill" in C, false);
  const D = Plot.group({}, {fill: "red", stroke: "x"});
  test.strictEqual(D.fill, "red");
  test.strictEqual(D.stroke.label, "x");
  test.strictEqual("z" in D, false);
});

tape("Plot.group does return specified options", test => {
  const A = Plot.group({}, {fill: null});
  test.strictEqual(A.fill, null);
  test.strictEqual("z" in A, false);
  test.strictEqual("stroke" in A, false);
  const B = Plot.group({}, {stroke: null});
  test.strictEqual(B.stroke, null);
  test.strictEqual("z" in B, false);
  test.strictEqual("fill" in B, false);
  const C = Plot.group({}, {z: null});
  test.strictEqual(C.z, null);
  test.strictEqual("fill" in C, false);
  test.strictEqual("stroke" in C, false);
});
