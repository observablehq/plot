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
      Plot.image(data, {...dodge, width: 60, src: "Portrait URL", clip: null}),
      Plot.dot(data, {...dodge, stroke: "white", dy: -5})
    ]
  });
}

export async function usPresidentGalleryRadius() {
  const data = await d3.csv<any>("data/us-president-favorability.csv", d3.autoType);
  return Plot.plot({
    height: 540,
    x: {
      label: "Date of first inauguration",
      inset: 30,
      grid: true
    },
    marks: [
      Plot.image(
        data,
        Plot.dodgeY({
          x: "First Inauguration Date",
          src: "Portrait URL",
          title: "Name",
          r: 30,
          padding: -2,
          anchor: "middle",
          clip: "ellipse(30% 50%)"
        })
      )
    ]
  });
}
