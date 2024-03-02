import * as Plot from "@observablehq/plot";
import assert from "assert";
import it from "./jsdom.js";

it("plot({aspectRatio}) rejects unsupported scale types", () => {
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, x: {type: "symlog"}}), /^Error: unsupported x scale for aspectRatio: symlog$/); // prettier-ignore
  assert.throws(() => Plot.dot([]).plot({aspectRatio: true, y: {type: "symlog"}}), /^Error: unsupported y scale for aspectRatio: symlog$/); // prettier-ignore
});

it("plot({}).dimensions() returns the expected values", () => {
  assert.deepStrictEqual(Plot.dot([]).plot().dimensions(), {
    marginTop: 20,
    marginRight: 20,
    marginBottom: 30,
    marginLeft: 40,
    width: 640,
    height: 400
  });
  assert.deepStrictEqual(
    Plot.dot(["short"], {x: (d, i) => 1 + i, y: (d) => d})
      .plot()
      .dimensions(),
    {
      marginTop: 20,
      marginRight: 20,
      marginBottom: 30,
      marginLeft: 40,
      width: 640,
      height: 80
    }
  );
});
