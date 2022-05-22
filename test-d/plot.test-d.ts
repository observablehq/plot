import { expectError } from "tsd";
import { ChannelOption, ConstantOrChannelOption, ExtractKeysByType, MarkOptions } from "../src/plot";

//#region Setup ---------------

type Datum = {
  colString1: string,
  colNum1: number,
  colString2: string,
  colNum2: number,
  colDate: Date,
}

//#endregion Setup


//#region Building blocks ---------------

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

let channelString: ChannelOption<string, Datum>;

// As column name, auto column names.
channelString = "colString1";

// As function.
channelString = (d?: Datum) => d ? d.colString1 : "";

// As function, coerced return type.
channelString = (d?: Datum) => d ? d.colDate.toString() : "";
channelString = (d?: Datum) => d ? String(d.colNum1) : "";

// As constant that is not a known column name.
expectError(channelString = "arbitraryString");

// As wrong type constant.
expectError(channelString = 1);

// As function, wrong return type.
expectError(channelString = (d?: Datum) => d ? d.colNum1 : 0);

// As function, wrong datum column name.
expectError(channelString = (d?: Datum) => d ? d.missingCol : "");

// As function, wrong param type.
expectError(channelString = (d?: { colOtherString: string }) => d ? d.colOtherString : "");


//#region Building blocks



//#region MarkOptions ---------------


//#endregion MarkOptions
