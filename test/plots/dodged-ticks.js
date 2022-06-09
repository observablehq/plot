import * as Plot from "@observablehq/plot";

export default async function() {
  return Plot.plot({
    marks: [
      Plot.dotX([1, 1, 1.3, 1.3, 2, 3], Plot.dodgeY({fill: "black"})),
      Plot.tickX([1, 1, 2, 3], Plot.dodgeY({anchor:"top", stroke: "red", dx: -4, strokeWidth:2})),
      Plot.tickX([1, 1, 2, 3], Plot.dodgeY({anchor:"middle", stroke: "blue", dx: 0, strokeWidth:2})),
      Plot.tickX([1, 1, 2, 3], Plot.dodgeY({anchor:"bottom", stroke: "green", dx: 4, strokeWidth:2})),
      Plot.ruleX([1.3, 1.3, 2, 3], Plot.dodgeY({anchor:"top", stroke: "red", dx: -4, strokeWidth:2})),
      Plot.ruleX([1.3, 1.3, 2, 3], Plot.dodgeY({anchor:"middle", stroke: "blue", dx: 0, strokeWidth:2})),
      Plot.ruleX([1.3, 1.3, 2, 3], Plot.dodgeY({anchor:"bottom", stroke: "green", dx: 4, strokeWidth:2}))
    ]
  });
}
