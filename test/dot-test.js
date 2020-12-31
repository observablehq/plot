const Plot = require("../");
const d3 = require("d3");
const tape = require("tape-await");
const {JSDOM} = require("jsdom");
global.document = new JSDOM("").window.document;

const array = [[0,0], [1,1], [2,-1], [3,2]];
const xy = array.map(([x,y]) => ({x,y}));

const A = Plot.plot({marks: [Plot.dot(xy, {x: "x", y: "y" })]}).outerHTML;

tape("dot accepts iterables", test => {
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot(new Set(array))]
  }).outerHTML, A);
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot(new Map(array))]
  }).outerHTML, A);
});

tape("dot accepts field accessors", test => {
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot(xy, {x: "x", y: "y"})]
  }).outerHTML, A);
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot(xy, {x: d => d.x, y: d => d.y})]
  }).outerHTML, A);
});

tape("dot accepts channel arrays", test => {
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot(xy, {x: array.map(d => d[0]), y: array.map(d => d[1])})]
  }).outerHTML, A);
});

tape("dot accepts functions to compute values on-the-fly", test => {
  test.equal(Plot.plot({
    x: { label: "x →" },
    y: { label: "↑ y" },
    marks: [Plot.dot({length: 4}, {
      x: (_, i) => array[i][0],
      y: (_, i) => array[i][1]
    })]
  }).outerHTML, A);

  const random = () => d3.randomNormal.source(d3.randomLcg(42))();
  test.equal(Plot.plot({
    marks: [Plot.dotY(Float64Array.from({length: 20}, random()))]
  }).outerHTML, Plot.plot({
    marks: [Plot.dotY({length: 20}, {y: random()})]
  }).outerHTML);
});

