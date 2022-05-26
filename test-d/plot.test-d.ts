//#region -------- Setup --------

type Datum = {
  colString1: string,
  colNum1: number,
  colString2: string,
  colNum2: number,
  colDate: Date,
}

//#endregion Setup


//#region -------- Building blocks --------

let colString: ExtractKeysByType<string, Datum>;

// Correct property keys.
colString = "colString1";
colString = "colString2";

// Incorrect property keys.
expectError(colString = "colNum1");
expectError(colString = "colDate");

let colNum: ExtractKeysByType<number, Datum>;

// Correct property keys.
colNum = "colNum1";
colNum = "colNum2";

// Incorrect property keys.
expectError(colNum = "colString1");
expectError(colNum = "colDate");

let colDate: ExtractKeysByType<Date, Datum>;

// Correct property keys.
colDate = "colDate";

// Incorrect property keys.
expectError(colDate = "colString1");
expectError(colDate = "colNum1");

//#endregion Building blocks

//#region -------- StandardMarkOptions --------

const options: StandardMarkOptions<Datum> = {};

// Constant or channel option.
options.fill = "#ccc";
options.fill = (d) => d.colString2;

// As function, incorrect return type.
expectError(options.fill = (d) => d.colNum1);

options.x = "100";
options.x = (d: Datum) => d.colNum1;

// As function, incorrect return type.
expectError(options.opacity = (d) => d.colString1);

// Channel-only option.
options.title = "colString1";
options.title = (d) => d.colString1;
options.title = () => "stringConstant";

// As constant.
expectError(options.title = "stringConstant");

// Incorrect return type.
expectError(options.title = () => 1);

// Constant-only option.
options.dx = 1;
options.target = "_self";
options.target = "_blank";
options.target = "_parent";
options.target = "_top";
options.clip = true;
options.clip = false;
options.clip = null;

expectError(options.dx = "stringConstant");
expectError(options.target = "_unknown");
expectError(options.clip = "true");
expectError(options.clip = "frame");

//#endregion StandardMarkOptions

import { expectError } from "tsd";
import { StandardMarkOptions } from "../src/plot";
import { ExtractKeysByType } from "../src/misc";
