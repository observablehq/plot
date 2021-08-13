import * as Plot from "@observablehq/plot";

export default async function() {
  const data = [{"series":0,"facet":0,"value":1,"x":1},{"series":1,"facet":0,"value":2,"x":1},{"series":0,"facet":0,"value":1,"x":2},{"series":0,"facet":0,"value":1,"x":3},{"series":1,"facet":0,"value":8,"x":4},{"series":1,"facet":0,"value":4,"x":5},{"series":1,"facet":0,"value":7,"x":6},{"series":1,"facet":0,"value":1,"x":7},{"series":0,"facet":0,"value":8,"x":8},{"series":1,"facet":0,"value":8,"x":9},{"series":1,"facet":1,"value":2,"x":0},{"series":1,"facet":1,"value":3,"x":1},{"series":1,"facet":1,"value":7,"x":2},{"series":0,"facet":1,"value":7,"x":3},{"series":0,"facet":1,"value":1,"x":4},{"series":0,"facet":1,"value":5,"x":5},{"series":1,"facet":1,"value":7,"x":6},{"series":1,"facet":1,"value":4,"x":7},{"series":1,"facet":1,"value":6,"x":8},{"series":1,"facet":1,"value":6,"x":9}];
  data.forEach(d => d.facet = d.facet ? "B" : "A");
  return Plot.plot({
    facet: { data, y: "facet" },
    marks: [
      Plot.frame(),
      Plot.areaY(data, Plot.groupX({
        y: "sum",
        filter: () => true
      }, {
        x: "x",
        y: "value",
        fill: "series",
        sort: "x",
        order: "series",
        thresholds: 10,
        fillOpacity: .5,
        curve: "linear"
      })),
  
      Plot.dot(data, Plot.stackY2(Plot.groupX({y: "sum"}, {
        x: "x",
        y: "value",
        fill: "series",
        thresholds: 10
      })))
    ],
    color: {type: "categorical"},
    y: {ticks: 10}
  });
}
