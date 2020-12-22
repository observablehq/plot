const Plot = require("../");
const tape = require("tape-await");
const d3 = require("d3-selection");
const gsvg = require("gsvg");
const jsdom = require("./jsdom.js");
global.document = jsdom("");

tape("Plot.dot creates circles of radius r=3 and given coordinates", test => {
  const svg = d3.select(Plot.plot({
    marks: [
      Plot.dot([[1, 0], [2, 3]])
    ]
  }));
  const dots = svg.selectAll("circle");
  test.equal(dots.size(), 2);
  test.deepEqual(attributes(dots, "r"), ["3", "3"]);
  test.deepEqual(attributes(dots, "cx"), ["40", "620"]);
  test.deepEqual(attributes(dots, "cy"), ["366", "20"]);
});

tape("Plot.dot ignores data with missing coordinates", test => {
  const svg = d3.select(Plot.plot({
    marks: [
      Plot.dot([[NaN, 0], [undefined, 0], [0, NaN], [0, undefined], [NaN, NaN], [0, 0]])
    ]
  }));
  const dots = svg.selectAll("circle");
  test.equal(dots.size(), 1);
});

tape("Plot.dot creates proportional symbols", test => {
  const svg = d3.select(Plot.plot({
    r: { domain: [0, 16] },
    marks: [
      Plot.dot([[0, 0, 1], [0, 0, 4], [0, 0, 9], [0, 0, 16]], { r: d => d[2] })
    ]
  }));
  const dots = svg.selectAll("circle");
  test.deepEqual(attributes(dots, "r"), ["0.75", "1.5", "2.25", "3"]);
});

tape("Plot.dot respects the x and y accessors", test => {
  const svg = d3.select(Plot.plot({
    x: { type: "ordinal", domain: ["A", 1], range: [10, 20] },
    y: { type: "ordinal", domain: ["A", 1], range: [13, 23] },
    marks: [
      Plot.dot(["A", "B"], {
        x: (d, i) => i || d,
        y: (d, i) => i || d
      })
    ]
  }));
  const dots = svg.selectAll("circle");
  test.deepEqual(attributes(dots, "cx"), ["10", "20"]);
  test.deepEqual(attributes(dots, "cy"), ["13", "23"]);
});

tape("Plot.dot respects the x and y accessors (innerHTML approach)", test => {
  const svg = d3.select(Plot.plot({
    x: { type: "ordinal", domain: ["A", 1], range: [10, 20] },
    y: { type: "ordinal", domain: ["A", 1], range: [13, 23] },
    marks: [
      Plot.dot(["A", "B"], {
        x: (d, i) => i || d,
        y: (d, i) => i || d
      })
    ]
  }));
  const layer = svg.select("circle").node().parentElement;
  test.equal(layer.innerHTML, `<circle cx="10" cy="13" r="3"></circle><circle cx="20" cy="23" r="3"></circle>`);
});

tape("Plot.dot respects the x and y accessors (gsvg approach)", async test => {
  const svg = d3.select(Plot.plot({
    x: { type: "ordinal", domain: ["A", 1], range: [10, 20] },
    y: { type: "ordinal", domain: ["A", 1], range: [13, 23] },
    marks: [
      Plot.dot(["A", "B"], {
        x: (d, i) => i || d,
        y: (d, i) => i || d
      })
    ]
  }));
  const layer = svg.select("circle").node().parentElement;
  gsvg(`<svg>${layer.innerHTML}</svg>`).then(t => test.equal(t,
    `<svg>
  <circle
     cx="10"
     cy="13"
     r="3"></circle>
  <circle
     cx="20"
     cy="23"
     r="3"></circle>
</svg>
`
  ));
});


function attributes(selection, attr) {
  const M = [];
  for (const e of selection) {
    M.push(e.getAttribute(attr));
  }
  return M;
}

