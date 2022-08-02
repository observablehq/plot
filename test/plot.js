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
    for (const svg of root.tagName === "svg" ? [root] : root.querySelectorAll("svg")) {
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    reindexStyle(root);
    reindexMarker(root);
    reindexClip(root);
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

function reindexStyle(root) {
  let index = 0;
  for (const style of root.querySelectorAll("style")) {
    const name = `plot${index++ ? `-${index}` : ""}`;
    const parent = style.parentNode;
    const uid = parent.getAttribute("class");
    for (const child of [parent, ...parent.querySelectorAll("[class]")]) {
      child.setAttribute("class", child.getAttribute("class").replace(new RegExp(`\\b${uid}\\b`, "g"), name));
    }
    style.textContent = style.textContent.replace(new RegExp(`[.]${uid}`, "g"), `.${name}`);
  }
}

function reindexMarker(root) {
  let index = 0;
  const map = new Map();
  for (const node of root.querySelectorAll("[id^=plot-marker-]")) {
    let id = node.getAttribute("id");
    if (map.has(id)) id = map.get(id);
    else map.set(id, (id = `plot-marker-${++index}`));
    node.setAttribute("id", id);
  }
  for (const key of ["marker-start", "marker-mid", "marker-end"]) {
    for (const node of root.querySelectorAll(`[${key}]`)) {
      let id = node.getAttribute(key).slice(5, -1);
      if (map.has(id)) node.setAttribute(key, `url(#${map.get(id)})`);
    }
  }
}

function reindexClip(root) {
  let index = 0;
  const map = new Map();
  for (const node of root.querySelectorAll("[id^=plot-clip-]")) {
    let id = node.getAttribute("id");
    if (map.has(id)) id = map.get(id);
    else map.set(id, (id = `plot-clip-${++index}`));
    node.setAttribute("id", id);
  }
  for (const key of ["clip-path"]) {
    for (const node of root.querySelectorAll(`[${key}]`)) {
      let id = node.getAttribute(key).slice(5, -1);
      if (map.has(id)) node.setAttribute(key, `url(#${map.get(id)})`);
    }
  }
}
