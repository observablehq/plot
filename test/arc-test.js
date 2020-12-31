const Plot = require("../");
//const d3 = require("d3");
//const tape = require("tape-await");
const {JSDOM} = require("jsdom");
global.document = new JSDOM("").window.document;

const array = [[0,0], [1,1], [2,-1], [3,2]];
const xy = array.map(([x,y]) => ({x,y}));

const A = Plot.plot({marks: [Plot.arc(xy, {startAngle: "x", endAngle: "y" })]}).outerHTML;

console.warn(A);

