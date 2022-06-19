export declare function Dimensions(scales: {
    y?: any;
    fy?: any;
    fx?: any;
}, { x: { axis: xAxis }, y: { axis: yAxis }, fx: { axis: fxAxis }, fy: { axis: fyAxis } }: {
    x?: {
        axis: any;
    };
    y?: {
        axis: any;
    };
    fx?: {
        axis: any;
    };
    fy?: {
        axis: any;
    };
}, { width, height, facet: { margin: facetMargin, marginTop: facetMarginTop, marginRight: facetMarginRight, marginBottom: facetMarginBottom, marginLeft: facetMarginLeft }, margin, marginTop, marginRight, marginBottom, marginLeft }?: {
    width?: number;
    height?: number;
    facet?: {
        margin: any;
        marginTop?: any;
        marginRight?: any;
        marginBottom?: any;
        marginLeft?: any;
    };
    margin: any;
    marginTop?: any;
    marginRight?: any;
    marginBottom?: any;
    marginLeft?: any;
}): {
    width: number;
    height: number;
    marginTop: any;
    marginRight: any;
    marginBottom: any;
    marginLeft: any;
    facetMarginTop: any;
    facetMarginRight: any;
    facetMarginBottom: any;
    facetMarginLeft: any;
};
