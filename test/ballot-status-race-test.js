const Plot = require("../");
const d3 = Object.assign(require("d3-array"), require("d3-dsv"));
const {readFileSync} = require("fs");
const svgCompare = require("./svgCompare.js");
const jsdom = require("./jsdom.js");
global.document = jsdom("");

const plot = require("./ballot-status-race.js");
const votes = d3.csvParse(readFileSync("test/data/nc-absentee-votes.csv", "utf8"), d3.autoType);
const svg = plot(votes, {d3, Plot});
svgCompare(svg, "ballot-status-race");
