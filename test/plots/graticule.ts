import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function graticule() {
  return Plot.plot({
    width: 960,
    height: 470,
    projection: {
      type: "equal-earth",
      rotate: [20, 40, 60]
    },
    marks: [Plot.sphere(), Plot.graticule()]
  });
});
