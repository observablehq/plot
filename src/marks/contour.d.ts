import {AbstractRaster} from "./raster.js";

/** @jsdoc contour */
export function contour(...args: any[]): Contour;

/** @jsdoc Contour */
export class Contour extends AbstractRaster {
  constructor(
    data: any,
    {
      smooth,
      value,
      ...options
    }?: {
      smooth?: boolean | undefined;
      value: any;
    }
  );
  contourChannels: {
    geometry: {
      value: {
        transform: (d: any) => any;
      };
    };
  };
  smooth: boolean;
  filter(
    index: any,
    {
      x,
      y,
      value,
      ...channels
    }: {
      [x: string]: any;
      x: any;
      y: any;
      value: any;
    },
    values: any
  ): any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
