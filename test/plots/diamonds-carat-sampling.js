import * as Plot from "@observablehq/plot";
import * as d3 from "d3";


function samples(array, m) {
  if (!((m = Math.floor(m)) > 0)) return []; // return nothing
  const n = array.length;
  if (!(n > m)) return [...array]; // return everything
  if (m === 1) return [array[n >> 1]]; // return the midpoint
  return Array.from({length: m}, (_, i) => array[Math.round(i / (m - 1) * (n - 1))]);
}

function sample({samples: n = 10, ...options}) {
  return Plot.transform(options, (data, facets) => ({data, facets: Array.from(facets, I => samples(I, n))}));
}

export default async function() {
  const data = await d3.csv("data/diamonds.csv", d3.autoType);
  return Plot.plot({
    marks: [
      Plot.dot(data, sample({
        x: "carat",
        y: "price",
        r: 1,
        fill: "currentColor",
        samples: 2000
      }))
    ]
  });
}
