import {readFile, unlink, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {createCanvas, loadImage} from "canvas";
import {max, mean, quantile} from "d3";
import beautify from "js-beautify";
import {expect, it} from "vitest";
import assert from "./assert.js";

export function test(plot) {
  const name = plot.name;
  it(name, async () => {
    const root = await (name.startsWith("warn") ? assert.warnsAsync : assert.doesNotWarnAsync)(plot);
    if ("ready" in root) await root.ready;
    const ext = root.tagName === "svg" ? "svg" : "html";
    for (const svg of root.tagName === "svg" ? [root] : root.querySelectorAll("svg")) {
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
      svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    reindexStyle(root);
    reindexMarker(root);
    reindexClip(root);
    reindexPattern(root);
    const actual = normalizeHtml(root.outerHTML);
    const outfile = join("test", "output", `${name}.${ext}`);
    const diffile = join("test", "output", `${name}-changed.${ext}`);
    try {
      await expect(maybeWithImages(actual, outfile)).resolves.toMatchFileSnapshot(join("..", "..", outfile));
      if (process.env.CI !== "true") {
        try {
          await unlink(diffile);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    } catch (error) {
      await writeFile(diffile, actual, "utf-8");
      throw error;
    }
  });
}

function normalizeHtml(html) {
  return beautify.html(
    html
      .replace(/&nbsp;/g, "\xa0") // normalize HTML entities
      .replace(/\d+\.\d{4,}/g, (d) => +(+d).toFixed(3)), // limit numerical precision
    {
      indent_size: 2,
      inline: ["title", "tspan", "span", "svg", "a", "i"],
      indent_inner_html: false
    }
  );
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

function reindexPattern(root) {
  let index = 0;
  const map = new Map();
  for (const node of root.querySelectorAll("[id^=plot-pattern-]")) {
    let id = node.getAttribute("id");
    if (map.has(id)) id = map.get(id);
    else map.set(id, (id = `plot-pattern-${++index}`));
    node.setAttribute("id", id);
  }
  for (const key of ["fill", "stroke"]) {
    for (const node of root.querySelectorAll(`[${key}]`)) {
      let id = node.getAttribute(key).slice(5, -1);
      if (map.has(id)) node.setAttribute(key, `url(#${map.get(id)})`);
    }
  }
}

const imageRe = /data:image\/png;base64,[^"]+/g;

async function maybeWithImages(actual, outfile) {
  let expected;
  try {
    expected = await readFile(outfile, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") return actual;
    throw error;
  }
  return withImages(actual, expected);
}

// Replace actual images with expected images when they match approximately.
// This lets toMatchFileSnapshot's exact comparison pass despite platform
// differences in PNG encoding.
async function withImages(actual, expected) {
  const actualImages = Array.from(actual.matchAll(imageRe), (m) => m[0]);
  const expectedImages = Array.from(expected.matchAll(imageRe), (m) => m[0]);
  if (actualImages.length !== expectedImages.length)
    throw new Error(`Expected ${expectedImages.length} images, got ${actualImages.length}`);
  for (let i = 0; i < actualImages.length; ++i) {
    if (await compareImage(actualImages[i], expectedImages[i])) {
      actual = actual.replace(actualImages[i], expectedImages[i]);
    }
  }
  return actual;
}

async function compareImage(a, b) {
  if (a === b) return false;
  const [imageA, imageB] = await Promise.all([getImageData(a), getImageData(b)]);
  const {width, height} = imageA;
  if (width !== imageB.width || height !== imageB.height) return false;
  const E = Uint8Array.from(imageA.data, (a, i) => Math.abs(a - imageB.data[i]));
  if (!(quantile(E, 0.95) <= 1)) return false; // at least 95% with almost no error
  if (!(mean(E) < 0.1)) return false; // no more than 0.1 average error
  if (!(max(E) < 10)) return false; // no more than 10 maximum error
  return true;
}

async function getImageData(url) {
  const image = await loadImage(url);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
}
