import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const alphabet = await d3.csv("data/alphabet.csv", d3.autoType);
  return Plot.plot({
    ariaLabel: "letter-frequency chart",
    ariaDescription: "A horizontal bar chart showing the relative frequency of letters in the English language.",
    x: {
      label: "Frequency (%) →",
      transform: (x) => x * 100,
      grid: true
    },
    y: {
      label: null
    },
    marks: [
      Plot.barX(alphabet, {
        x: "frequency",
        y: "letter",
        ariaLabel: (
          (f) => (d) =>
            `${d.letter} ${f(d.frequency)}`
        )(d3.format(".1%")),
        sort: {y: "x"}
      }),
      Plot.ruleX([0])
    ],
    height: 580
  });
}
