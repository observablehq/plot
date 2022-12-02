import * as Plot from "@observablehq/plot";

// This geometry collection represents the Hawaiian islands in the convention of
// GeoJSON’s RFC 7946, which is the opposite of D3 and TopoJSON’s convention,
// which Plot also uses. In this case, we want to fit the projection to the
// actual extent of the islands (and not the whole globe), but when we draw the
// shape of each island, we respect the D3 convention and paint them towards the
// exterior.
const polygon = {
  type: "GeometryCollection",
  geometries: [
    {
      type: "Polygon",
      coordinates: [
        [
          [-155.6, 18.9],
          [-155.5, 19.1],
          [-155.3, 19.3],
          [-155, 19.3],
          [-154.8, 19.5],
          [-155.1, 19.7],
          [-155.1, 19.9],
          [-155.3, 20],
          [-155.6, 20.1],
          [-155.9, 20.3],
          [-155.9, 20.1],
          [-155.8, 20],
          [-155.9, 19.9],
          [-156.1, 19.7],
          [-155.9, 19.3],
          [-155.9, 19.1],
          [-155.9, 19],
          [-155.6, 18.9]
        ]
      ]
    },
    {
      type: "Polygon",
      coordinates: [
        [
          [-156.6, 21],
          [-156.7, 20.9],
          [-156.6, 20.8],
          [-156.5, 20.8],
          [-156.4, 20.6],
          [-156.4, 20.6],
          [-156.1, 20.7],
          [-156, 20.8],
          [-156.3, 21],
          [-156.5, 20.9],
          [-156.6, 21]
        ]
      ]
    },
    {
      type: "Polygon",
      coordinates: [
        [
          [-157, 21.2],
          [-157.2, 21.2],
          [-157.3, 21.1],
          [-157.1, 21.1],
          [-157, 21.2]
        ]
      ]
    },
    {
      type: "Polygon",
      coordinates: [
        [
          [-158, 21.7],
          [-158.1, 21.6],
          [-158.3, 21.6],
          [-158.1, 21.3],
          [-157.9, 21.3],
          [-157.8, 21.5],
          [-158, 21.7]
        ]
      ]
    },
    {
      type: "Polygon",
      coordinates: [
        [
          [-159.5, 22.2],
          [-159.7, 22.2],
          [-159.8, 22],
          [-159.4, 21.9],
          [-159.3, 22],
          [-159.3, 22.1],
          [-159.4, 22.2],
          [-159.5, 22.2]
        ]
      ]
    }
  ]
};

export default async function () {
  return Plot.plot({
    inset: 20,
    projection: {type: "mercator", domain: polygon},
    marks: [Plot.geo(polygon, {fill: (d, i) => `Island ${i}`, fillOpacity: 0.1}), Plot.geo(polygon, {strokeWidth: 1.5})]
  });
}
