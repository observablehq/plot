import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function waffleY() {
  const data = d3.csvParse(
    `group,label,freq
Infants <1,0-1,16467
Children <11,1-11,30098
Teens 12-17,12-17,20354
Adults 18+,18+,12456
Elderly 65+,65+,12456`,
    d3.autoType
  );
  return Plot.plot({
    marks: [
      Plot.waffleY(data, {x: "group", fill: "group", y: (d) => d.freq / 100}),
      Plot.ruleY([0])
    ]
  });
}
