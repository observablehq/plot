import {assert, it} from "vitest";
import * as Plot from "@observablehq/plot";

it("Plot uses the context’s event", () => {
  Plot.lineY([1, 2, 3], {tip: true}).plot();
  assert.ok(true);
});
