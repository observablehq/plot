import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function hrefFill() {
  return Plot.text(
    {length: 1},
    {
      text: ["click me"],
      x: 0,
      y: 0,
      fill: "red",
      href: [`https://google.com/search?q=12345`]
    }
  ).plot();
});
