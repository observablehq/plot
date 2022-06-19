export declare function Channel(data: string | any[], { scale, type, value, filter, hint }: {
    value: any;
    scale: string;
}): {
    scale: string;
    type: any;
    value: any;
    label: undefined;
    filter: any;
    hint: any;
};
export declare function channelSort(channels: {
    find: (arg0: ([, { scale }]: [any, {
        scale: any;
    }]) => boolean) => any;
}, facetChannels: {
    find: (arg0: ([, { scale }]: [any, {
        scale: any;
    }]) => boolean) => any;
}, data: any, options: {
    [x: string]: any;
    reverse?: any;
    reduce?: any;
    limit?: any;
}): void;
