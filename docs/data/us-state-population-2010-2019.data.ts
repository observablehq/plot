import fs from "node:fs";
import {csvParse} from "d3";

export default {
  watch: ["../public/data/us-state-population-2010-2019.csv"],
  load([file]) {
    return csvParse(fs.readFileSync(file, "utf-8"));
  }
};
