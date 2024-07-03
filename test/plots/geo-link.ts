import * as Plot from "@observablehq/plot";

export async function geoLink() {
  const xy = {x1: [-122.4194], y1: [37.7749], x2: [2.3522], y2: [48.8566]};
  return Plot.plot({
    projection: "equal-earth",
    marks: [
      Plot.sphere(),
      Plot.graticule(),
      Plot.link({length: 1}, {curve: "linear", strokeOpacity: 0.3, ...xy}),
      Plot.link({length: 1}, {markerEnd: "arrow", ...xy})
    ]
  });
}
