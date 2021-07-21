import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/nba-2021-data.csv", d3.autoType);
  return Plot.plot({
    inset: 20,
    marks: [
      Plot.image(
        data, 
        {
          x: 'homeWins',
          y: 'awayWins',
          href: 'imageUrl',
          size: 'wins',
          title: 'name'
        }
      )
    ]
  });
}
