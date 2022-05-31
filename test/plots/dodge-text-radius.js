import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const random = d3.randomLcg(42);
  return Plot.plot({
    height: 200,
    marks: [
      Plot.text({length: 200}, Plot.dodgeY({x: random, r: random}))
    ]
  });
}
