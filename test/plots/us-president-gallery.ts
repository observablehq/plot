import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usPresidentGallery() {
  const data = await d3.csv<any>("data/us-president-favorability.csv", d3.autoType);
  const dodge = Plot.sort(
    {channel: "y"},
    Plot.dodgeY<Plot.MarkOptions>({
      sort: {channel: "x"},
      x: "First Inauguration Date",
      title: "Name",
      r: 22
    })
  );
  return Plot.plot({
    inset: 30,
    width: 960,
    height: 300,
    marks: [
      Plot.image(data, {...dodge, width: 60, src: "Portrait URL"}),
      Plot.dot(data, {...dodge, stroke: "white", dy: -5})
    ]
  });
}
