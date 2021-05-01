import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("the group transform doesn't return undefined channels", test => {
  const A = Plot.group({});
  test.assert(!("z" in A));
  test.assert(!("fill" in A));
  test.assert(!("stroke" in A));
});

tape("the group transform doesn't return undefined channels for constants", test => {
  const A = Plot.group({}, {fill: "red"});
  test.assert(A.fill === "red");
  test.assert(!("z" in A));
  test.assert(!("stroke" in A));
  const B = Plot.group({}, {stroke: "red"});
  test.assert(B.stroke === "red");
  test.assert(!("z" in B));
  test.assert(!("fill" in B));
});

tape("the group transform doesn't return undefined channels for constants", test => {
  const A = Plot.group({}, {fill: "red", stroke: "x"});
  test.assert(A.fill === "red");
  test.assert(A.stroke.label === "x");
  test.assert(!("z" in A));
});
