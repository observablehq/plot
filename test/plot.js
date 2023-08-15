import {promises as fs} from "fs";
import {loadImage} from "canvas";
import * as path from "path";
import beautify from "js-beautify";
import assert from "./assert.js";
import it from "./jsdom.js";
import * as plots from "./plots/index.js";

for (const [name, plot] of Object.entries(plots)) {
  it(`plot ${name}`, async () => {
    const root = await (name.startsWith("warn") ? assert.warnsAsync : assert.doesNotWarnAsync)(plot);
    const ext = root.tagName === "svg" ? "svg" : "html";
    for (const svg of root.tagName === "svg" ? [root] : root.querySelectorAll("svg")) {
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    reindexStyle(root);
    reindexMarker(root);
    reindexClip(root);
    let expected;
    let actual = beautify.html(root.outerHTML, {
      indent_size: 2,
      inline: ["title", "tspan", "span", "svg", "a", "i"],
      indent_inner_html: false
    });
    const outfile = path.resolve("./test/output", `${path.basename(name, ".js")}.${ext}`);
    const diffile = path.resolve("./test/output", `${path.basename(name, ".js")}-changed.${ext}`);

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

    // node-canvas won’t produce the same output on different architectures, so
    // we parse and re-encode images before comparison.
    const equal = (await normalizeImageData(actual)) === (await normalizeImageData(expected));

    if (equal) {
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

    assert.ok(equal, `${name} must match snapshot`);
  });
}

function reindexStyle(root) {
  const uid = "plot-d6a7b5"; // see defaultClassName
  for (const style of root.querySelectorAll("style")) {
    const parent = style.parentNode;
    for (const child of [parent, ...parent.querySelectorAll("[class]")]) {
      child.setAttribute("class", child.getAttribute("class").replace(new RegExp(`\\b${uid}\\b`, "g"), "plot"));
    }
    style.textContent = style.textContent.replace(new RegExp(`[.]${uid}\\b`, "g"), `.plot`);
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

async function normalizeImageData(string) {
  const re = /data:image\/png;base64,[^"]+/g;
  let replaced = string;
  let match;
  let i = 0;
  while ((match = re.exec(string))) {
    const image = await loadImage(match[0]);
    replaced = `${string.slice(i, match.index)}${image.src}${string.slice((i = re.lastIndex))}`;
  }
  return replaced;
}
