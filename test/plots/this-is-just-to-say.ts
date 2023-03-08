import * as Plot from "@observablehq/plot";

export async function thisIsJustToSay() {
  return Plot.plot({
    height: 200,
    marks: [
      Plot.frame(),
      Plot.text(
        [
          `This Is Just To Say\nWilliam Carlos Williams, 1934\n\nI have eaten\nthe plums\nthat were in\nthe icebox\n\nand which\nyou were probably\nsaving\nfor breakfast\n\nForgive me\nthey were delicious\nso sweet\nand so cold`
        ],
        {frameAnchor: "middle"}
      )
    ]
  });
}
