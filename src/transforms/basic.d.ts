// TODO

export function basic(
  options: {} | undefined,
  transform: any
): {
  transform: any;
  sort?: any;
};

export function initializer(
  options: {} | undefined,
  initializer: any
): {
  initializer: any;
  sort?: any;
};

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

export function reverse(options: any):
  | {
      sort: null;
      transform: any;
    }
  | {
      sort: null;
      initializer: any;
    };

export function shuffle(options?: {}):
  | {
      sort: null;
      transform: any;
    }
  | {
      sort: null;
      initializer: any;
    };

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
