import {Mark} from "../mark.js";

/** @jsdoc density */
export function density(data: any, options?: {}): Density;

export class Density extends Mark {
  constructor(
    data: any,
    {
      x,
      y,
      z,
      weight,
      fill,
      stroke,
      ...options
    }?: {
      x: any;
      y: any;
      z: any;
      weight: any;
      fill: any;
      stroke: any;
    }
  );
  fill: any;
  stroke: any;
  z: any;
  filter(index: any): any;
  render(
    index: any,
    scales: any,
    channels: any,
    dimensions: any,
    context: any
  ):
    | HTMLElement
    | HTMLCanvasElement
    | HTMLImageElement
    | SVGImageElement
    | HTMLVideoElement
    | HTMLAnchorElement
    | HTMLScriptElement
    | HTMLEmbedElement
    | HTMLFormElement
    | HTMLHeadElement
    | HTMLAreaElement
    | SVGSVGElement
    | HTMLObjectElement
    | HTMLLinkElement
    | HTMLMapElement
    | HTMLInputElement
    | HTMLDataElement
    | HTMLProgressElement
    | HTMLTrackElement
    | HTMLSourceElement
    | HTMLButtonElement
    | HTMLAudioElement
    | HTMLBaseElement
    | HTMLQuoteElement
    | HTMLBodyElement
    | HTMLBRElement
    | HTMLTableCaptionElement
    | HTMLTableColElement
    | HTMLDataListElement
    | HTMLModElement
    | HTMLDetailsElement
    | HTMLDialogElement
    | HTMLDivElement
    | HTMLDListElement
    | HTMLFieldSetElement
    | HTMLHeadingElement
    | HTMLHRElement
    | HTMLHtmlElement
    | HTMLIFrameElement
    | HTMLLabelElement
    | HTMLLegendElement
    | HTMLLIElement
    | HTMLMenuElement
    | HTMLMetaElement
    | HTMLMeterElement
    | HTMLOListElement
    | HTMLOptGroupElement
    | HTMLOptionElement
    | HTMLOutputElement
    | HTMLParagraphElement
    | HTMLPictureElement
    | HTMLPreElement
    | HTMLSelectElement
    | HTMLSlotElement
    | HTMLSpanElement
    | HTMLStyleElement
    | HTMLTableElement
    | HTMLTableSectionElement
    | HTMLTableCellElement
    | HTMLTemplateElement
    | HTMLTextAreaElement
    | HTMLTimeElement
    | HTMLTitleElement
    | HTMLTableRowElement
    | HTMLUListElement
    | SVGSymbolElement
    | SVGFilterElement
    | SVGSetElement
    | SVGStopElement
    | SVGViewElement
    | SVGClipPathElement
    | SVGMarkerElement
    | SVGMaskElement
    | SVGAnimateElement
    | SVGAnimateMotionElement
    | SVGAnimateTransformElement
    | SVGCircleElement
    | SVGDefsElement
    | SVGDescElement
    | SVGEllipseElement
    | SVGFEBlendElement
    | SVGFEColorMatrixElement
    | SVGFEComponentTransferElement
    | SVGFECompositeElement
    | SVGFEConvolveMatrixElement
    | SVGFEDiffuseLightingElement
    | SVGFEDisplacementMapElement
    | SVGFEDistantLightElement
    | SVGFEDropShadowElement
    | SVGFEFloodElement
    | SVGFEFuncAElement
    | SVGFEFuncBElement
    | SVGFEFuncGElement
    | SVGFEFuncRElement
    | SVGFEGaussianBlurElement
    | SVGFEImageElement
    | SVGFEMergeElement
    | SVGFEMergeNodeElement
    | SVGFEMorphologyElement
    | SVGFEOffsetElement
    | SVGFEPointLightElement
    | SVGFESpecularLightingElement
    | SVGFESpotLightElement
    | SVGFETileElement
    | SVGFETurbulenceElement
    | SVGForeignObjectElement
    | SVGGElement
    | SVGLineElement
    | SVGLinearGradientElement
    | SVGMetadataElement
    | SVGMPathElement
    | SVGPathElement
    | SVGPatternElement
    | SVGPolygonElement
    | SVGPolylineElement
    | SVGRadialGradientElement
    | SVGRectElement
    | SVGSwitchElement
    | SVGTextElement
    | SVGTextPathElement
    | SVGTSpanElement
    | SVGUseElement
    | null;
}
