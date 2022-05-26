type Dateable = Date | {valueOf: () => number};

declare module 'isoformat' {
    export function format(value: Dateable, fallback: string | ((v: Dateable) => string)): string;
    export function parse(value: string, fallback: string | ((s: string) => Date)): Date;
}
