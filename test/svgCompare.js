const {readFileSync, writeFileSync} = require("fs");
const tape = require("tape-await");
const gsvg = require("gsvg");

module.exports = async function svgCompare(svg, ref) {
  // make the svg visible in the browser
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (svg.style.font === "sans-serif 10px 10px") {
    svg.style.font = "";
    svg.style.fontFamily = "sans-serif";
    svg.style.fontSize = "10px";
  }
  
  const outfile = `test/reference/${ref}.svg`;
  const actual = await gsvg(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svg.outerHTML}`);

  tape("Plot.dot respects the x and y accessors (gsvg approach)", test => {
    let expected;
    try {
      expected = readFileSync(outfile, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(`! generating ${outfile}`);
        writeFileSync(outfile, actual, "utf8");
        return;
      } else {
        throw error;
      }
    }
    test.equal(actual, expected);
  });
};
