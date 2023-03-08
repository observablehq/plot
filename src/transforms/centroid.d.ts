// TODO

export function centroid({
  geometry,
  ...options
}?: {
  geometry?:
    | {
        transform: (d: any) => any;
      }
    | undefined;
}): {
  initializer: any;
  sort?: any;
};

export function geoCentroid({
  geometry,
  ...options
}?: {
  geometry?:
    | {
        transform: (d: any) => any;
      }
    | undefined;
}): {
  x: {
    transform: (data: any) => Float64Array;
  };
  y: {
    transform: () => Float64Array;
  };
};
