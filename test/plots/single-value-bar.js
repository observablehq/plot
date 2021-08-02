import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    marks: [
      Plot.barY({length: 1}, {x: ["foo"], y1: [0], y2: [0]}),
      Plot.ruleX(["foo"], {stroke: "red", y1: [0], y2: [0]}),
      Plot.dot({length: 1}, {x: ["foo"], y: [0], r: 100, fill: "white"}),
      Plot.text({length: 1}, {x: ["foo"], y: [0], text: ["♜"], fontSize: 180})
    ]
  });
}
