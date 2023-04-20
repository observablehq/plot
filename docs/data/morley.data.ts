import fs from "node:fs";
import {csvParse} from "d3";

export default {
  watch: ["../public/data/morley.csv"],
  load([file]) {
    return csvParse(fs.readFileSync(file, "utf-8"));
  }
};
