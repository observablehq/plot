import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function longLabels() {
  const responses = d3.tsvParse(`name\tvalue
Family in feud with Zucker\u00adbergs\t.17
Committed 671 birthdays to memory\t.19
Ex is doing too well\t.10
High school friends all dead now\t.15
Discovered how to “like” things mentally\t.27
Not enough politics\t.12
`);
  return Plot.plot({
    margin: 20,
    marginLeft: 40,
    marginBottom: 40,
    height: 400,
    x: {label: null},
    y: {percent: true, label: "↑ Responses (%)"},
    marks: [
      Plot.axisX({lineWidth: 8}),
      Plot.barY(responses, {x: "name", y: "value"}),
      Plot.gridY({color: "#eee", opacity: 0.2}),
      Plot.ruleY([0])
    ]
  });
}
