import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const data = await d3.csv("data/us-president-favorability.csv", d3.autoType);
  const opts = Plot.sort(
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
    marks: [Plot.image(data, opts), Plot.dot(data, {...opts, dy: -5})]
  });
}
