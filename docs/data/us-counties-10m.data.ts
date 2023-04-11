import fs from "node:fs";

export default {
  watch: ["./testdata/us-counties-10m.json"],
  load([file]) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  }
};
