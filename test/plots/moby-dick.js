import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function () {
  const mobydick = await d3.text("data/moby-dick-chapter-1.txt");
  return Plot.plot({
    height: 1200,
    marks: [Plot.text([mobydick], {fontSize: 14, lineWidth: 40, lineHeight: 1.2, frameAnchor: "top-left"})]
  });
}
