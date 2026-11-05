import * as Plot from "@observablehq/plot";
import {assert, it} from "vitest";

it("plot({aspectRatio}) rejects unsupported scale types", () => {
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, x: {type: "symlog"}}), /unsupported x scale for aspectRatio: symlog$/); // prettier-ignore
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, y: {type: "symlog"}}), /unsupported y scale for aspectRatio: symlog$/); // prettier-ignore
});
