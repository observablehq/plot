import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

// Country code to continent; coverage limited to sport=boxing.
const continent = new Map(
  // prettier-ignore
  [
    ["Africa", ["ALG", "EGY", "MAR", "SEY", "KEN", "TUN", "CPV", "CMR", "NGR", "NAM", "CAF", "UGA", "MRI", "CGO"]],
    ["Americas", ["BRA", "VEN", "ARG", "USA", "CAN", "CUB", "PAN", "ECU", "COL", "MEX", "DOM", "PUR", "TTO"]],
    ["Asia", ["AZE", "KAZ", "RUS", "TUR", "THA", "TJK", "ARM", "JPN", "TKM", "UZB", "CHN", "PHI", "MGL", "TPE", "IRI", "KGZ", "QAT", "JOR", "IND", "KOR", "IRQ"]],
    ["Europe", ["SWE", "GBR", "GER", "IRL", "ITA", "FRA", "BUL", "UKR", "BLR", "LTU", "NED", "CRO", "POL", "HUN", "ROU", "FIN", "ESP", "HON"]],
    ["Oceania", ["AUS", "FSM", "PNG"]]
  ].flatMap(([continent, codes]) => codes.map((code) => [code, continent]))
);

export default async function () {
  const athletes = (await d3.csv("data/athletes.csv", d3.autoType)).filter((d) => d.sport === "boxing" && d.height);
  return Plot.plot({
    width: 600,
    height: 350,
    facet: {data: athletes, x: "nationality"},
    y: {domain: [1.45, 2.1]},
    fx: {transform: (countryCode) => continent.get(countryCode), label: "continent"},
    marks: [
      Plot.frame(),
      Plot.dot(athletes, Plot.dodgeX({y: "height", title: "nationality", fill: "currentColor", anchor: "middle"}))
    ]
  });
}
