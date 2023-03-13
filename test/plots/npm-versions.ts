import * as Plot from "@observablehq/plot";

export async function npmVersions() {
  const versions = [
    {version: "0.5.0", downloads: 7},
    {version: "0.5.1", downloads: 6},
    {version: "0.5.2", downloads: 7},
    {version: "0.6.0", downloads: 7},
    {version: "0.6.1", downloads: 8},
    {version: "0.6.2", downloads: 4},
    {version: "0.7.0", downloads: 4},
    {version: "0.7.1", downloads: 2434},
    {version: "0.8.0", downloads: 6},
    {version: "0.8.1", downloads: 77},
    {version: "1.0.0", downloads: 245},
    {version: "1.0.1", downloads: 9712},
    {version: "1.0.2", downloads: 2461},
    {version: "1.0.3", downloads: 18},
    {version: "1.1.0", downloads: 103},
    {version: "1.1.1", downloads: 758},
    {version: "1.2.0", downloads: 6845},
    {version: "1.2.1", downloads: 88628},
    {version: "1.2.2", downloads: 26},
    {version: "1.2.3", downloads: 4},
    {version: "1.2.4", downloads: 1313149},
    {version: "2.0.0", downloads: 765},
    {version: "2.0.1", downloads: 6},
    {version: "2.0.2", downloads: 75},
    {version: "2.0.3", downloads: 871},
    {version: "2.1.0", downloads: 16},
    {version: "2.2.0", downloads: 1212},
    {version: "2.3.0", downloads: 254},
    {version: "2.3.1", downloads: 2538},
    {version: "2.3.2", downloads: 124},
    {version: "2.3.3", downloads: 37650},
    {version: "2.4.0", downloads: 48693},
    {version: "2.5.0", downloads: 12756},
    {version: "2.5.1", downloads: 743},
    {version: "2.6.0", downloads: 1125},
    {version: "2.7.0", downloads: 509},
    {version: "2.7.1", downloads: 3234},
    {version: "2.8.0", downloads: 24886},
    {version: "2.9.0", downloads: 1803},
    {version: "2.9.1", downloads: 19828},
    {version: "2.10.0", downloads: 414},
    {version: "2.11.0", downloads: 34090},
    {version: "2.12.0", downloads: 8686},
    {version: "2.12.1", downloads: 1350944},
    {version: "3.0.0", downloads: 5},
    {version: "3.0.1", downloads: 13942},
    {version: "3.0.2", downloads: 12132},
    {version: "3.0.3", downloads: 24},
    {version: "3.0.4", downloads: 26361},
    {version: "3.1.0", downloads: 349},
    {version: "3.1.1", downloads: 278205},
    {version: "3.1.2", downloads: 125},
    {version: "3.1.3", downloads: 375},
    {version: "3.1.4", downloads: 3550},
    {version: "3.1.5", downloads: 2004},
    {version: "3.1.6", downloads: 89445},
    {version: "3.2.0", downloads: 490566},
    {version: "3.2.1", downloads: 438869}
  ];
  const order = Plot.valueof(versions, "version");
  return Plot.plot({
    x: {grid: true},
    y: {reverse: true},
    color: {scheme: "rainbow", domain: order},
    marks: [
      Plot.barX(versions, {
        x: "downloads",
        y: (d) => parseInt(d.version),
        order,
        fill: "version",
        title: "version",
        insetLeft: 1
      }),
      Plot.text(
        versions,
        Plot.stackX({
          x: "downloads",
          y: (d) => parseInt(d.version),
          order,
          text: (d) => (d.downloads > 50e3 ? d.version : ""),
          z: "version"
        })
      ),
      Plot.ruleX([0])
    ]
  });
}
