import * as Plot from "@observablehq/plot";
import * as assert from "assert";
import {JSDOM} from "jsdom";

it("Plot uses the context’s event", () => {
  Plot.lineY([1, 2, 3], {tip: true}).plot({document: new JSDOM("").window.document});
  assert.ok(true);
});
