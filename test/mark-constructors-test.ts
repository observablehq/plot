// Verify that all mark classes can be extended.
// See https://github.com/observablehq/plot/issues/2422

import * as Plot from "@observablehq/plot";
import {describe, it} from "vitest";

describe("mark constructors", () => {
  const data = [1, 2, 3];

  // data + options
  class MyArea extends Plot.Area {
    constructor(data: Plot.Data, options: Plot.AreaOptions) {
      super(data, options);
    }
  }
  class MyArrow extends Plot.Arrow {
    constructor(data: Plot.Data, options: Plot.ArrowOptions) {
      super(data, options);
    }
  }
  class MyBarX extends Plot.BarX {
    constructor(data: Plot.Data, options: Plot.BarXOptions) {
      super(data, options);
    }
  }
  class MyBarY extends Plot.BarY {
    constructor(data: Plot.Data, options: Plot.BarYOptions) {
      super(data, options);
    }
  }
  class MyCell extends Plot.Cell {
    constructor(data: Plot.Data, options: Plot.CellOptions) {
      super(data, options);
    }
  }
  class MyContour extends Plot.Contour {
    constructor(data: Plot.Data, options: Plot.ContourOptions) {
      super(data, options);
    }
  }
  class MyDensity extends Plot.Density {
    constructor(data: Plot.Data, options: Plot.DensityOptions) {
      super(data, options);
    }
  }
  class MyDot extends Plot.Dot {
    constructor(data: Plot.Data, options: Plot.DotOptions) {
      super(data, options);
    }
  }
  class MyGeo extends Plot.Geo {
    constructor(data: Plot.Data, options: Plot.GeoOptions) {
      super(data, options);
    }
  }
  class MyImage extends Plot.Image {
    constructor(data: Plot.Data, options: Plot.ImageOptions) {
      super(data, options);
    }
  }
  class MyLine extends Plot.Line {
    constructor(data: Plot.Data, options: Plot.LineOptions) {
      super(data, options);
    }
  }
  class MyLink extends Plot.Link {
    constructor(data: Plot.Data, options: Plot.LinkOptions) {
      super(data, options);
    }
  }
  class MyRaster extends Plot.Raster {
    constructor(data: Plot.Data, options: Plot.RasterOptions) {
      super(data, options);
    }
  }
  class MyRect extends Plot.Rect {
    constructor(data: Plot.Data, options: Plot.RectOptions) {
      super(data, options);
    }
  }
  class MyRuleX extends Plot.RuleX {
    constructor(data: Plot.Data, options: Plot.RuleXOptions) {
      super(data, options);
    }
  }
  class MyRuleY extends Plot.RuleY {
    constructor(data: Plot.Data, options: Plot.RuleYOptions) {
      super(data, options);
    }
  }
  class MyText extends Plot.Text {
    constructor(data: Plot.Data, options: Plot.TextOptions) {
      super(data, options);
    }
  }
  class MyTickX extends Plot.TickX {
    constructor(data: Plot.Data, options: Plot.TickXOptions) {
      super(data, options);
    }
  }
  class MyTickY extends Plot.TickY {
    constructor(data: Plot.Data, options: Plot.TickYOptions) {
      super(data, options);
    }
  }
  class MyTip extends Plot.Tip {
    constructor(data: Plot.Data, options: Plot.TipOptions) {
      super(data, options);
    }
  }
  class MyVector extends Plot.Vector {
    constructor(data: Plot.Data, options: Plot.VectorOptions) {
      super(data, options);
    }
  }
  class MyWaffleX extends Plot.WaffleX {
    constructor(data: Plot.Data, options: Plot.WaffleXOptions) {
      super(data, options);
    }
  }
  class MyWaffleY extends Plot.WaffleY {
    constructor(data: Plot.Data, options: Plot.WaffleYOptions) {
      super(data, options);
    }
  }

  // no data
  class MyFrame extends Plot.Frame {
    constructor(options: Plot.FrameOptions) {
      super(options);
    }
  }
  class MyHexgrid extends Plot.Hexgrid {
    constructor(options: Plot.HexgridOptions) {
      super(options);
    }
  }

  it("Area", () => Plot.plot({marks: [new MyArea(data, {x1: Plot.identity, y1: Plot.identity})]}));
  it("Arrow", () =>
    Plot.plot({
      marks: [new MyArrow(data, {x1: Plot.identity, y1: Plot.identity, x2: Plot.identity, y2: Plot.identity})]
    }));
  it("BarX", () => Plot.plot({marks: [new MyBarX(data, {x1: 0, x2: Plot.identity, y: Plot.identity})]}));
  it("BarY", () => Plot.plot({marks: [new MyBarY(data, {y1: 0, y2: Plot.identity, x: Plot.identity})]}));
  it("Cell", () => Plot.plot({marks: [new MyCell(data, {x: Plot.identity})]}));
  it("Contour", () =>
    Plot.plot({marks: [new MyContour(data, {x: Plot.identity, y: Plot.identity, fill: Plot.identity})]}));
  it("Density", () => Plot.plot({marks: [new MyDensity(data, {x: Plot.identity, y: Plot.identity})]}));
  it("Dot", () => Plot.plot({marks: [new MyDot(data, {x: Plot.identity})]}));
  it("Geo", () => Plot.plot({marks: [new MyGeo([{type: "Point", coordinates: [0, 0]}], {geometry: Plot.identity})]}));
  it("Image", () => Plot.plot({marks: [new MyImage(data, {x: Plot.identity, y: Plot.identity, src: "test.png"})]}));
  it("Line", () => Plot.plot({marks: [new MyLine(data, {x: Plot.identity, y: Plot.identity})]}));
  it("Link", () =>
    Plot.plot({
      marks: [new MyLink(data, {x1: Plot.identity, y1: Plot.identity, x2: Plot.identity, y2: Plot.identity})]
    }));
  it("Raster", () =>
    Plot.plot({marks: [new MyRaster(data, {x: Plot.identity, y: Plot.identity, fill: Plot.identity})]}));
  it("Rect", () => Plot.plot({marks: [new MyRect(data, {x1: Plot.identity, x2: Plot.identity})]}));
  it("RuleX", () => Plot.plot({marks: [new MyRuleX(data, {x: Plot.identity})]}));
  it("RuleY", () => Plot.plot({marks: [new MyRuleY(data, {y: Plot.identity})]}));
  it("Text", () => Plot.plot({marks: [new MyText(data, {x: Plot.identity, text: Plot.identity})]}));
  it("TickX", () => Plot.plot({marks: [new MyTickX(data, {x: Plot.identity})]}));
  it("TickY", () => Plot.plot({marks: [new MyTickY(data, {y: Plot.identity})]}));
  it("Tip", () => Plot.plot({marks: [new MyTip(data, {x: Plot.identity})]}));
  it("Vector", () => Plot.plot({marks: [new MyVector(data, {x: Plot.identity, y: Plot.identity})]}));
  it("WaffleX", () => Plot.plot({marks: [new MyWaffleX(data, {x1: 0, x2: Plot.identity, y: Plot.identity})]}));
  it("WaffleY", () => Plot.plot({marks: [new MyWaffleY(data, {y1: 0, y2: Plot.identity, x: Plot.identity})]}));
  it("Frame", () => Plot.plot({marks: [new MyFrame({})]}));
  it("Hexgrid", () => Plot.plot({marks: [new MyHexgrid({})]}));
});
