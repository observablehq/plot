import * as Plot from "@observablehq/plot";
import {JSDOM} from "jsdom";
import tape from "tape-await";

tape("empty marks are ignored", test => {
  global.document = new JSDOM("").window.document;
  test.equal(
    Plot.plot({ marks: [undefined, 0, null, Plot.dotX([0])] }).innerHTML,
    Plot.plot({ marks: [Plot.dotX([0])] }).innerHTML
  );
  const data = [1,2,3];
  test.equal(
    Plot.plot({
      facet: { data, y: d => d },
      marks: [ false, Plot.dotX(data) ]
    }).innerHTML,
    Plot.plot({
      facet: { data, y: d => d },
      marks: [ Plot.dotX(data) ]
    }).innerHTML
  );
  delete global.document;
});
