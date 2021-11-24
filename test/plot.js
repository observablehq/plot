import assert from "assert";
import {promises as fs} from "fs";
import * as path from "path";
import beautify from "js-beautify";
import it from "./jsdom.js";
import * as plots from "./plots/index.js";

for (const [name, plot] of Object.entries(plots)) {
  it(`plot ${name}`, async () => {
    const root = await plot();
    const ext = root.tagName === "svg" ? "svg" : "html";
    const svg = root.tagName === "svg" ? root : root.querySelector("svg");
    if (svg) {
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    const style = root.querySelector("style");
    if (style) {
      const parent = style.parentNode;
      const uid = parent.getAttribute("class");
      for (const child of [parent, ...parent.querySelectorAll("[class]")]) {
        child.setAttribute("class", child.getAttribute("class").replace(new RegExp(`\\b${uid}\\b`, "g"), "plot"));
      }
      style.textContent = style.textContent.replace(new RegExp(`[.]${uid}`, "g"), ".plot");
    }
    const actual = beautify.html(root.outerHTML, {indent_size: 2});
    const outfile = path.resolve("./test/output", `${path.basename(name, ".js")}.${ext}`);
    const diffile = path.resolve("./test/output", `${path.basename(name, ".js")}-changed.${ext}`);
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
  });
}
