//#region -------- Setup --------

type Datum = {
  colString1: string,
  colNum1: number,
  colString2: string,
  colNum2: number,
  colDate: Date,
}

//#endregion Setup

//#region -------- ChannelOption --------

let channelString: ChannelOption<string, Datum>;

// As column name, auto column names.
channelString = "colString1";

// As function.
channelString = () => "arbitraryStringConstant";
channelString = (d) => d.colString1;

// As function, coerced return type.
channelString = (d) => d.colDate.toString();
channelString = (d) => String(d.colNum1);
channelString = (d, i) => i.toString();

// As constant that is not a known column name.
expectError(channelString = "arbitraryStringConstant");

// Incorrect constant type.
expectError(channelString = 1);

// As function, incorrect return type.
expectError(channelString = (d) => d.colNum1);

// As function, incorrect datum column name.
expectError(channelString = (d) => d.unknownCol);

// As function, incorrect param type.
expectError(channelString = (d: { unknownCol: string }) => d.unknownCol);

//#endregion ChannelOption

//#region -------- ConstantOrChannelOption --------

let constantOrChannelString: ConstantOrChannelOption<string, Datum>;

// As column name, auto column names.
constantOrChannelString = "colString1";

// As function.
constantOrChannelString = (d) => d.colString1;

// As function, coerced return type.
constantOrChannelString = (d) => d.colDate.toString();
constantOrChannelString = (d) => String(d.colNum1);

// As constant that is not a known column name.
constantOrChannelString = "arbitraryStringConstant";

// Incorrect constant type.
expectError(constantOrChannelString = 1);

// As function, incorrect return type.
expectError(constantOrChannelString = (d) => d.colNum1);

// As function, incorrect datum column name.
expectError(constantOrChannelString = (d) => d.unknownCol);

// As function, incorrect param type.
expectError(constantOrChannelString = (d: { unknownCol: string }) => d.unknownCol);

//#endregion ConstantOrChannelOption

import { expectError } from "tsd";
import { ChannelOption, ConstantOrChannelOption, ExtractKeysByType } from "../src/misc";
