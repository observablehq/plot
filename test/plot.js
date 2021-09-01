import assert from "assert";
import {promises as fs} from "fs";
import * as path from "path";
import {JSDOM} from "jsdom";
import beautify from "js-beautify";
import * as plots from "./plots/index.js";

(async () => {
  for (const [name, plot] of Object.entries(plots)) {
    it(`plot ${name}`, async () => {
      try {
        // Not recommended, but this is only our test code, so should be fine?
        const {window} = new JSDOM("");
        global.document = window.document;
        global.Node = window.Node;

        // Not fully functional, but only used to fetch data files, so should be fine?
        global.fetch = async (href) => new Response(path.resolve("./test", href));

        const root = await plot();
        const [ext, svg] = root.tagName === "svg" ? ["svg", root] : ["html", root.querySelector("svg")];
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        const actual = beautify.html(root.outerHTML, {indent_size: 2});
        const outfile = path.resolve("./test/output", path.basename(name, ".js") + "." + ext);
        const diffile = path.resolve("./test/output", path.basename(name, ".js") + "-changed." + ext);
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

        if (actual === expected) {
          if (process.env.CI !== "true") {
            try {
              await fs.unlink(diffile);
              console.warn(`! deleted ${diffile}`);
            } catch (error) {
              if (error.code !== "ENOENT") {
                throw error;
              }
            }
          }
        } else {
          console.warn(`! generating ${diffile}`);
          await fs.writeFile(diffile, actual, "utf8");
        }

        assert(actual === expected, `${name} must match snapshot`);
      } finally {
        delete global.document;
        delete global.Node;
        delete global.fetch;
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
