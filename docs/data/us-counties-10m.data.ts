import fs from "node:fs";

export default {
  watch: ["../public/data/us-counties-10m.json"],
  load([file]) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
};
