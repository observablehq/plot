import {promises as fs} from "fs";
import * as path from "path";
import {JSDOM} from "jsdom";
import {html as beautify} from "js-beautify";
import tape from "tape-await";
import * as plots from "./plots/index.js";

(async () => {
  for (const [name, plot] of Object.entries(plots)) {
    tape(`plot ${name}`, async test => {
      try {
        // Not recommended, but this is only our test code, so should be fine?
        global.document = new JSDOM("").window.document;

        // Not fully functional, but only used to fetch data files, so should be fine?
        global.fetch = async (href) => new Response(path.resolve("./test", href));

        const svg = await plot();
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        const actual = beautify(svg.outerHTML, {indent_size: 2});
        const outfile = path.resolve("./test/output", path.basename(name, ".js") + ".svg");
        let expected;

        try {
          expected = await fs.readFile(outfile, "utf8");
        } catch (error) {
          if (error.code === "ENOENT" && process.env.CI !== "true") {
            console.warn(`! generating ${outfile}`);
            await fs.writeFile(outfile, actual, "utf8");
            return;
          } else {
            throw error;
          }
        }

        test.ok(actual === expected, `${name} must match snapshot`);
      } finally {
        global.document = undefined;
        global.fetch = undefined;
      }
    });
  }
})();

class Response {
  constructor(href) {
    this._href = href;
    this.ok = true;
    this.status = 200;
  }
  async text() {
    return fs.readFile(this._href, {encoding: "utf-8"});
  }
  async json() {
    return JSON.parse(await this.text());
  }
}
