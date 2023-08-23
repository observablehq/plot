import * as Plot from "@observablehq/plot";
import assert from "assert";
import {JSDOM} from "jsdom";
const {
  window: {document}
} = new JSDOM("");

it("The aspectRatio option rejects unsupported scale types", () => {
  assert.throws(
    () => Plot.dot([]).plot({document, aspectRatio: true, x: {type: "symlog"}}),
    /^Error: unsupported x scale for aspectRatio: symlog$/
  );
  assert.throws(
    () => Plot.dot([]).plot({document, aspectRatio: true, y: {type: "symlog"}}),
    /^Error: unsupported y scale for aspectRatio: symlog$/
  );
});
