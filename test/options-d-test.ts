import {valueof} from "../src/options.js";

// A function is not a valid input data
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
valueof(() => {}, "field");

// A Promise is not a valid input data
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
valueof(new Promise(() => {}), "field");

// A symbol is not a valid value
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
valueof(null, Symbol("field"));

// A bigint is not a valid value
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
valueof(null, 2n);
