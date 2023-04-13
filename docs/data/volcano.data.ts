import fs from "node:fs";

export default {
  watch: ["./testdata/volcano.json"],
  load([file]) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
};
