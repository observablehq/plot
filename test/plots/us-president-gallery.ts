import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export async function usPresidentGallery() {
  const presidents = await d3.csv<any>("data/us-president-favorability.csv", d3.autoType);
  return Plot.plot({
    inset: 30,
    width: 960,
    height: 300,
    marks: [
      Plot.image(
        presidents,
        Plot.dodgeY({
          x: "First Inauguration Date",
          r: 22,
          preserveAspectRatio: "xMidYMin slice", // try not to clip heads
          src: "Portrait URL",
          title: "Name"
        })
      )
    ]
  });
}

export async function usPresidentGalleryAlt() {
  const presidents = await d3.csv<any>("data/us-president-favorability.csv", d3.autoType);
  return Plot.plot({
    inset: 30,
    width: 960,
    height: 300,
    marks: [
      Plot.image(
        presidents,
        Plot.sort(
          {channel: "y"}, // try not to occlude the heads
          {
            ...Plot.dodgeY({
              x: "First Inauguration Date",
              r: 22,
              dy: -10, // these aren’t circles, so don’t overlap the x-axis
              src: "Portrait URL",
              title: "Name",
              width: 60
            }),
            r: null // don’t clip the images
          }
        )
      )
    ]
  });
}
