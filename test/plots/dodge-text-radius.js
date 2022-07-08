import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const random = d3.randomLcg(42);
  const length = 100;
  const X = Float64Array.from({length}, random);
  const R = Float64Array.from({length}, random);
  return Plot.plot({
    height: 400,
    nice: true,
    r: {
      range: [0, 22]
    },
    marks: [Plot.dot({length}, Plot.dodgeY({x: X, r: R})), Plot.text({length}, Plot.dodgeY({x: X, r: R}))]
  });
}
