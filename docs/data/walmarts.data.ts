import fs from "node:fs";
import {tsvParse} from "d3";

export default {
  watch: ["../public/data/walmarts.tsv"],
  load([file]) {
    return tsvParse(fs.readFileSync(file, "utf-8"));
  }
};
