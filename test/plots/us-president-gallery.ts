import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usPresidentGallery() {
  const data = await d3.csv<any>("data/us-president-favorability.csv", d3.autoType);
  const options = Plot.sort(
    {channel: "y"},
    Plot.dodgeY({
      sort: {channel: "x"},
      x: "First Inauguration Date",
      width: 60,
      src: "Portrait URL",
      title: "Name",
      stroke: "white",
      r: 22
    })
  );
  return Plot.plot({
    inset: 30,
    width: 960,
    height: 300,
    marks: [Plot.image(data, options), Plot.dot(data, {...options, dy: -5})]
  });
}
