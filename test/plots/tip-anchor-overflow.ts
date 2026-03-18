import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function tipAnchorOverflow() {
  return Plot.rectX([1, 1, 1, 1, 1], {
    x: Plot.identity,
    fill: Plot.indexOf,
    title: () =>
      "Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum Lorem ipsum lorem ipsum lorem ipsum",
    tip: true
  }).plot({height: 100, marginTop: 20});
});
