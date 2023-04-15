import fs from "node:fs";
import {csvParse} from "d3";

export default {
  watch: ["../public/data/crimean-war.csv"],
  load([file]) {
    const crimea = csvParse(fs.readFileSync(file, "utf-8"));;
    return {columns: crimea.columns, rows: crimea};
  }
};
