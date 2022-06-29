/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "isoformat" {
  export function format(value: any, fallback: string): string;
  export function format(value: any, fallback: any): any;
  export function parse(value: string): Date;
}
