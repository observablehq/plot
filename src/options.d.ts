/** @jsdoc valueof */
export function valueof(data: any, value: any, type: any): any;

/** @jsdoc column */
export function column(source: any): (((v: any) => any) | {transform: () => any; label: any})[];

/** @jsdoc identity */
export interface identity {
  transform(d: any): any;
}
