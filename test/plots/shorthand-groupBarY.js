import * as Plot from "@observablehq/plot";

export default async function () {
  const gene = "AAAAGAGTGAAGATGCTGGAGACGAGTGAAGCATTCACTTTAGGGAAAGCGAGGCAAGAGCGTTTCAGAAGACGAAACCTGGTAGGTGCACTCACCACAG";
  return Plot.barY(gene, Plot.groupX()).plot();
}
