export function basic({ filter: f1, sort: s1, reverse: r1, transform: t1, ...options }: {
    filter: any;
    sort: any;
    reverse: any;
    transform: any;
}, t2: any): {
    transform: any;
    sort: any;
};
export function filter(value: any, options: any): {
    transform: any;
    sort: any;
};
export function reverse(options: any): {
    transform: any;
    sort: any;
};
export function shuffle({ seed, ...options }?: {
    seed: any;
}): {
    transform: any;
    sort: any;
};
export function sort(value: any, options: any): {
    transform: any;
    sort: any;
};
