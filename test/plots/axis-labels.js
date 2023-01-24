import * as Plot from "@observablehq/plot";

export async function axisLabelX() {
  return Plot.plot({
    inset: 6,
    x: {type: "linear"},
    y: {type: "linear", axis: null},
    marks: [
      Plot.frame(),
      Plot.axisX({anchor: "top", label: "top-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "top", label: "top-center", labelAnchor: "center"}),
      Plot.axisX({anchor: "top", label: "top-right", labelAnchor: "right"}),
      Plot.axisX({anchor: "bottom", label: "bottom-left", labelAnchor: "left"}),
      Plot.axisX({anchor: "bottom", label: "bottom-center", labelAnchor: "center"}),
      Plot.axisX({anchor: "bottom", label: "bottom-right", labelAnchor: "right"})
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
      Plot.axisY({anchor: "left", label: "left-center", labelAnchor: "center"}),
      Plot.axisY({anchor: "left", label: "left-bottom", labelAnchor: "bottom"}),
      Plot.axisY({anchor: "right", label: "right-top", labelAnchor: "top"}),
      Plot.axisY({anchor: "right", label: "right-center", labelAnchor: "center"}),
      Plot.axisY({anchor: "right", label: "right-bottom", labelAnchor: "bottom"})
    ]
  });
}
