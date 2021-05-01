import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("Plot.bin does not return unspecified channels", test => {
  const A = Plot.bin({});
  test.strictEqual("z" in A, false);
  test.strictEqual("fill" in A, false);
  test.strictEqual("stroke" in A, false);
  const B = Plot.bin({}, {fill: "red"});
  test.strictEqual(B.fill, "red");
  test.strictEqual("z" in B, false);
  test.strictEqual("stroke" in B, false);
  const C = Plot.bin({}, {stroke: "red"});
  test.strictEqual(C.stroke, "red");
  test.strictEqual("z" in C, false);
  test.strictEqual("fill" in C, false);
  const D = Plot.bin({}, {fill: "red", stroke: "x"});
  test.strictEqual(D.fill, "red");
  test.strictEqual(D.stroke.label, "x");
  test.strictEqual("z" in D, false);
});

tape("Plot.bin does return speCified options", test => {
  const A = Plot.bin({}, {fill: null});
  test.strictEqual(A.fill, null);
  test.strictEqual("z" in A, false);
  test.strictEqual("stroke" in A, false);
});
