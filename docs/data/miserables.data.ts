import fs from "node:fs";

export default {
  watch: ["../public/data/miserables.json"],
  load([file]) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
};
