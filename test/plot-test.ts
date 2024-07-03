import * as Plot from "@observablehq/plot";
import assert from "assert";
import it from "./jsdom.js";

it("plot({aspectRatio}) rejects unsupported scale types", () => {
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, x: {type: "symlog"}}), /^Error: unsupported x scale for aspectRatio: symlog$/); // prettier-ignore
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, y: {type: "symlog"}}), /^Error: unsupported y scale for aspectRatio: symlog$/); // prettier-ignore
});
