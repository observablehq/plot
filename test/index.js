import {promises as fs} from "fs";
import * as path from "path";
import {JSDOM} from "jsdom";
import {html as beautify} from "js-beautify";

// TODO Dynamic import of every test, or pass as command-line argument?
import test from "./penguin-mass-sex.js";

// Not recommended, but this is only our test code, so should be fine?
global.document = new JSDOM("").window.document;

// Not fully functional, but only used to fetch data files, so should be fine?
global.fetch = async (href) => {
  href = path.resolve("./test", href);
  return {
    ok: true,
    status: 200,
    text: () => fs.readFile(href, {encoding: "utf-8"})
  };
};

test().then(chart => {
  console.log(beautify(chart.outerHTML, {indent_size: 2}));
  return chart;
});
