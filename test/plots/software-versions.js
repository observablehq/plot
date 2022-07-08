import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/software-versions.csv");

  function stack({text, fill, ...options} = {}) {
    return Plot.stackX({
      ...Plot.groupZ(
        {
          x: "proportion",
          text: "first"
        },
        {
          z: "version",
          order: "value",
          text,
          fill
        }
      ),
      reverse: true,
      ...options
    });
  }

  return Plot.plot({
    x: {
      percent: true
    },
    color: {
      type: "ordinal",
      scheme: "blues"
    },
    marks: [
      Plot.barX(data, stack({fill: "version", insetLeft: 0.5, insetRight: 0.5})),
      Plot.text(data, stack({text: "version"})),
      Plot.ruleX([0, 1])
    ]
  });
}
