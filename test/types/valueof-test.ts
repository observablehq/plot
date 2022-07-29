import {expectType} from "tsd";
import {valueof} from "../../src/options";

expectType<null>(valueof(null, "red"));
expectType<undefined>(valueof(undefined, (d) => d + 10));
