/** @jsdoc hexbin */
export function hexbin(
  outputs?: {
    fill: string;
  },
  {
    binWidth,
    ...options
  }?: {
    binWidth: any;
  }
): {
  initializer: any;
  sort?: any;
};
