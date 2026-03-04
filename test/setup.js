import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

// Reflect modern high-DPI screens; JSDOM defaults to 1.
window.devicePixelRatio = 2;

// Mock fetch to load local test data files
global.fetch = async (href) => ({
  ok: true,
  status: 200,
  async text() {
    return readFile(resolve("./test", href), "utf-8");
  },
  async json() {
    return JSON.parse(await this.text());
  }
});

// JSDOM doesn't implement getBBox; stub it to avoid uncaught errors from
// postrender callbacks (e.g., tip marks using requestAnimationFrame).
if (typeof SVGElement !== "undefined" && !SVGElement.prototype.getBBox) {
  SVGElement.prototype.getBBox = function () {
    return {x: 0, y: 0, width: 0, height: 0};
  };
}
