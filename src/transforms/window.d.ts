/** @jsdoc windowX */
export function windowX(
  windowOptions: {} | undefined,
  options: any,
  ...args: any[]
): {
  transform: any;
  sort?: any;
};

/** @jsdoc windowY */
export function windowY(
  windowOptions: {} | undefined,
  options: any,
  ...args: any[]
): {
  transform: any;
  sort?: any;
};

/** @jsdoc window */
export function window(options?: {}): {
  map(I: any, S: any, T: any): void;
};
