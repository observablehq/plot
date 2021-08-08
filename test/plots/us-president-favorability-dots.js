import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/us-president-favorability.csv", d3.autoType);
  return Plot.plot({
    inset: 20,
    width: 900,
    height: 600,
    y: {
      label: 'Net Favorability',
      tickFormat: d => d+'%'
    },
    marks: [
      Plot.ruleY([0]),
      Plot.image(
        data, 
        {
          x: 'First Inauguration Date',
          y: d => 
            d['Very Favorable %'] + 
            d['Somewhat Favorable %'] - 
            d['Very Unfavorable %'] - 
            d['Somewhat Unfavorable %'],
          href: 'Portrait URL',
          r: 30,
          title: 'Name'
        }
      )
    ]
  });
}
