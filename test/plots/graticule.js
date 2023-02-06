import * as Plot from "@observablehq/plot";

export default async function () {
  return Plot.plot({
    width: 960,
    height: 470,
    projection: {
      type: "equal-earth",
      rotate: [20, 40, 60]
    },
    marks: [Plot.sphere(), Plot.graticule()]
  });
}
