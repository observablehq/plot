import * as Plot from "@observablehq/plot";
import {test} from "test/plot";

test(async function shorthandGroupBarY() {
  const gene = "AAAAGAGTGAAGATGCTGGAGACGAGTGAAGCATTCACTTTAGGGAAAGCGAGGCAAGAGCGTTTCAGAAGACGAAACCTGGTAGGTGCACTCACCACAG";
  return Plot.barY(gene, Plot.groupX()).plot();
});
