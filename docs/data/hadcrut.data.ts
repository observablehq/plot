import fs from "node:fs";

export default {
  watch: ["../public/data/hadcrut-annual.txt"],
  load([file]) {
    return fs
      .readFileSync(file, "utf-8")
      .trim()
      .split(/\n/g) // split into lines
      .map((line) => line.split(/\s+/g)); // split each line into fields
  }
};
