import * as Plot from "@observablehq/plot";

export default function () {
  return Plot.plot({
    inset: 12,
    width: 200,
    height: 200,
    marks: [
      Plot.frame(),
      Plot.vector([null], {
        length: 100,
        rotate: -135,
        anchor: "start",
        frameAnchor: "top-right",
        dx: -10,
        dy: 10
      }),
      Plot.vector([null], {
        length: 100,
        rotate: 45,
        anchor: "start",
        frameAnchor: "bottom-left",
        dx: 10,
        dy: -10
      }),
      Plot.vector([null], {
        length: 100,
        rotate: 135,
        anchor: "start",
        frameAnchor: "top-left",
        dx: 10,
        dy: 10
      }),
      Plot.vector([null], {
        length: 100,
        rotate: -45,
        anchor: "start",
        frameAnchor: "bottom-right",
        dx: -10,
        dy: -10
      }),
      Plot.text([null], {
        x: null,
        y: null,
        text: () => "Ο"
      })
    ]
  });
}
