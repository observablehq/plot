import * as Plot from "@observablehq/plot";
import tape from "tape-await";

tape("exports Frame", test => {
  test.ok(Object.keys(Plot).includes("plot"));
});
