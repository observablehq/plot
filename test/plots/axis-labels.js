import * as Plot from "@observablehq/plot";

export async function axisLabelX() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear"},
    y: {type: "linear", axis: null},
    marks: [
      Plot.frame(),
      Plot.axisX({anchor: "top", label: "top-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "top", label: "top-center", labelAnchor: "center", ticks: []}),
      Plot.axisX({anchor: "top", label: "top-right", labelAnchor: "right", ticks: []}),
      Plot.axisX({anchor: "bottom", label: "bottom-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "bottom", label: "bottom-center", labelAnchor: "center", ticks: []}),
      Plot.axisX({anchor: "bottom", label: "bottom-right", labelAnchor: "right", ticks: []})
    ]
  });
}

export async function axisLabelY() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear", axis: null},
    y: {type: "linear"},
    marks: [
      Plot.frame(),
      Plot.axisY({anchor: "left", label: "left-top", labelAnchor: "top"}),
      Plot.axisY({anchor: "left", label: "left-center", labelAnchor: "center", ticks: []}),
      Plot.axisY({anchor: "left", label: "left-bottom", labelAnchor: "bottom", ticks: []}),
      Plot.axisY({anchor: "right", label: "right-top", labelAnchor: "top"}),
      Plot.axisY({anchor: "right", label: "right-center", labelAnchor: "center", ticks: []}),
      Plot.axisY({anchor: "right", label: "right-bottom", labelAnchor: "bottom", ticks: []})
    ]
  });
}
