import {Mark} from "../mark.js";

/** @jsdoc ruleX */
export function ruleX(data: any, options: any): RuleX;

/** @jsdoc ruleY */
export function ruleY(data: any, options: any): RuleY;

/** @jsdoc RuleX */
export class RuleX extends Mark {
  constructor(data: any, options?: {});
  insetTop: any;
  insetBottom: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}

/** @jsdoc RuleY */
export class RuleY extends Mark {
  constructor(data: any, options?: {});
  insetRight: any;
  insetLeft: any;
  render(index: any, scales: any, channels: any, dimensions: any, context: any): any;
}
