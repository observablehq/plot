import * as Plot from "@observablehq/plot";
import assert from "assert";
import it from "../jsdom.js";

it("plot(…).legend() exposes a scale method", () => {
  const L = Plot.legend({
    color: {domain: [400, 750]}
  });
  assert.deepStrictEqual(L.scale("color").domain, [400, 750]);
});

