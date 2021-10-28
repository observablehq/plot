import * as Plot from "@observablehq/plot";

export default async function() {
  const chart = Plot.dotX([{o: 1}, {o: 10}], {
    fillOpacity: "o"
  }).plot({ opacity: {type: "log", label: "opaque", legend: true}});
  return chart.legend("opacity");
}
