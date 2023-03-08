import type {Data, MarkOptions, RenderableMark} from "../mark.js";

export interface RuleOptions extends MarkOptions {
  // TODO
}

export function ruleX(data?: Data | null, options?: RuleOptions): RuleX;

export function ruleY(data?: Data | null, options?: RuleOptions): RuleY;

export class RuleX extends RenderableMark {}

export class RuleY extends RenderableMark {}
