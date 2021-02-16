import * as Plot from "@observablehq/plot";
import {JSDOM} from "jsdom";
import tape from "tape-await";

tape("empty marks are ignored", test => {
  global.document = new JSDOM("").window.document;
  test.equal(
    Plot.plot({ marks: [undefined, 0, null, Plot.dotX([0])] }).innerHTML,
    Plot.plot({ marks: [Plot.dotX([0])] }).innerHTML
  );
  delete global.document;
});
