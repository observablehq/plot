/** @jsdoc transform */
export function basic(
  options: {} | undefined,
  transform: any
): {
  transform: any;
  sort?: any;
};

/** @jsdoc initializer */
export function initializer(
  options: {} | undefined,
  initializer: any
): {
  initializer: any;
  sort?: any;
};

/** @jsdoc filter */
export function filter(
  test: any,
  options: any
):
  | {
      transform: any;
      sort?: any;
    }
  | {
      initializer: any;
      sort?: any;
    };

/** @jsdoc reverse */
export function reverse(options: any):
  | {
      sort: null;
      transform: any;
    }
  | {
      sort: null;
      initializer: any;
    };

/** @jsdoc shuffle */
export function shuffle(options?: {}):
  | {
      sort: null;
      transform: any;
    }
  | {
      sort: null;
      initializer: any;
    };

/** @jsdoc sort */
export function sort(
  order: any,
  options: any
):
  | {
      sort: null;
      transform: any;
    }
  | {
      sort: null;
      initializer: any;
    };
