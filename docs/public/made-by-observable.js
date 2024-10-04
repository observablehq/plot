var app=function(){"use strict";function t(){}function o(t){return t()}function e(){return Object.create(null)}function n(t){t.forEach(o)}function r(t){return"function"==typeof t}function a(t,o){return t!=t?o==o:t!==o||t&&"object"==typeof t||"function"==typeof t}function i(t,o){t.appendChild(o)}function s(t,o,e){t.insertBefore(o,e||null)}function c(t){t.parentNode&&t.parentNode.removeChild(t)}function l(t){return document.createElement(t)}function p(){return t=" ",document.createTextNode(t);var t}function d(t,o,e,n){return t.addEventListener(o,e,n),()=>t.removeEventListener(o,e,n)}function u(t,o,e){null==e?t.removeAttribute(o):t.getAttribute(o)!==e&&t.setAttribute(o,e)}function h(t){const o={};for(const e of t)o[e.name]=e.value;return o}let f;function b(t){f=t}function v(t){(function(){if(!f)throw new Error("Function called outside component initialization");return f})().$$.on_mount.push(t)}const g=[],x=[];let m=[];const y=[],w=Promise.resolve();let $=!1;function k(t){m.push(t)}const _=new Set;let E=0;function L(){if(0!==E)return;const t=f;do{try{for(;E<g.length;){const t=g[E];E++,b(t),C(t.$$)}}catch(t){throw g.length=0,E=0,t}for(b(null),g.length=0,E=0;x.length;)x.pop()();for(let t=0;t<m.length;t+=1){const o=m[t];_.has(o)||(_.add(o),o())}m.length=0}while(g.length);for(;y.length;)y.pop()();$=!1,_.clear(),b(t)}function C(t){if(null!==t.fragment){t.update(),n(t.before_update);const o=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,o),t.after_update.forEach(k)}}const M=new Set;function O(t,o){const e=t.$$;null!==e.fragment&&(!function(t){const o=[],e=[];m.forEach((n=>-1===t.indexOf(n)?o.push(n):e.push(n))),e.forEach((t=>t())),m=o}(e.after_update),n(e.on_destroy),e.fragment&&e.fragment.d(o),e.on_destroy=e.fragment=null,e.ctx=[])}function T(t,o){-1===t.$$.dirty[0]&&(g.push(t),$||($=!0,w.then(L)),t.$$.dirty.fill(0)),t.$$.dirty[o/31|0]|=1<<o%31}function z(a,i,s,l,p,d,u,h=[-1]){const v=f;b(a);const g=a.$$={fragment:null,ctx:[],props:d,update:t,not_equal:p,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(i.context||(v?v.$$.context:[])),callbacks:e(),dirty:h,skip_bound:!1,root:i.target||v.$$.root};u&&u(g.root);let x=!1;if(g.ctx=s?s(a,i.props||{},((t,o,...e)=>{const n=e.length?e[0]:o;return g.ctx&&p(g.ctx[t],g.ctx[t]=n)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](n),x&&T(a,t)),o})):[],g.update(),x=!0,n(g.before_update),g.fragment=!!l&&l(g.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);g.fragment&&g.fragment.l(t),t.forEach(c)}else g.fragment&&g.fragment.c();i.intro&&((m=a.$$.fragment)&&m.i&&(M.delete(m),m.i(y))),function(t,e,a,i){const{fragment:s,after_update:c}=t.$$;s&&s.m(e,a),i||k((()=>{const e=t.$$.on_mount.map(o).filter(r);t.$$.on_destroy?t.$$.on_destroy.push(...e):n(e),t.$$.on_mount=[]})),c.forEach(k)}(a,i.target,i.anchor,i.customElement),L()}var m,y;b(v)}let P;function S(o){let e,r,a,h,f,b,v,g,x;return{c(){e=l("div"),r=l("div"),a=l("div"),a.textContent="Made by Observable",h=p(),f=l("div"),b=p(),v=l("div"),v.innerHTML='<div class="popup-wrapper"><div class="popup-header">Observable Platform</div> \n      <div class="popup-content"><div><a class="section" href="https://observablehq.com/cloud/"><h2>Observable Cloud</h2>\n            The only development and hosting environment made exclusively for Observable\n            Framework apps</a> \n          <a class="section" href="https://observablehq.com/documentation/notebooks/"><h2>Observable Notebooks</h2>\n            Experiment and prototype by building visualizations in live JavaScript\n            notebooks</a></div> \n        <div><a class="section" href="https://observablehq.com/framework/"><h2>Observable Framework</h2>\n            Use Observable Framework to build data apps locally. With data loaders,\n            you can build in any language or library, including Python, SQL, and\n            R</a> \n          <a class="section" href="https://observablehq.com/plot/"><h2>Observable Plot</h2>\n            An open-source JavaScript library, Observable Plot allows you to create\n            expressive charts with concise code</a> \n          <a class="section" href="https://d3js.org"><h2>D3</h2>\n            With over 256M downloads, D3 is the leading way to create bespoke visualizations\n            with JavaScript</a></div></div> \n      <div class="popup-footer"><a href="https://observablehq.com/platform">Discover the Observable Platform →</a></div></div>',this.c=t,u(a,"class","button-text"),u(f,"class","button-icon"),u(r,"class","button"),u(v,"class","popup")},m(t,n){s(t,e,n),i(e,r),i(r,a),o[5](a),i(r,h),i(r,f),o[6](f),o[7](r),i(e,b),i(e,v),o[8](v),g||(x=[d(r,"click",o[4]),d(r,"keypress",o[4])],g=!0)},p:t,i:t,o:t,d(t){t&&c(e),o[5](null),o[6](null),o[7](null),o[8](null),g=!1,n(x)}}}function q(t,o,e){const n=window.matchMedia("(max-width: 640px)");let r,a,i,s;function c(t,o){i&&s&&(t?(e(2,i.style.display="none",i),e(3,s.innerHTML='<svg width="16" height="16" viewBox="0 0 10 16" stroke="currentColor" strokeWidth="2">\n\t\t<path d="M1 4L9 12M9 4L1 12" />\n\t  </svg>',s),e(3,s.style.padding="0px",s)):(console.log("aaa"),e(2,i.style.display="block",i),e(2,i.style.paddingLeft=o?"4px":"8px",i),e(2,i.innerHTML=o?"Observable":"Made by Observable",i),e(3,s.innerHTML='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n\t\t<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor"\n\t\t  d="M4.41435 6.53148C4.6731 6.20803 5.14507 6.15559 5.46852 6.41435L8.125 8.53953L10.7815 6.41435C11.1049 6.15559 11.5769 6.20803 11.8356 6.53148C12.0944 6.85492 12.042 7.32689 11.7185 7.58565L8.125 10.4605L4.53148 7.58565C4.20803 7.32689 4.15559 6.85492 4.41435 6.53148Z"\n\t\t/>\n\t  </svg>',s),e(3,s.style.paddingLeft=o?"2px":"4px",s),e(3,s.style.paddingRight=o?"4px":"8px",s)))}return v((()=>{console.log("onMount"),c(!1,n.matches),n.addEventListener("change",(t=>{c(!1,t.matches)}))})),[r,a,i,s,function(){"ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?(console.log(a),a.style.display&&"none"!==a.style.display?(console.log("close"),e(1,a.style.display="none",a),c(!1,n.matches)):(console.log("open"),e(1,a.style.display="block",a),c(!0,n.matches))):console.log("no touch")},function(t){x[t?"unshift":"push"]((()=>{i=t,e(2,i)}))},function(t){x[t?"unshift":"push"]((()=>{s=t,e(3,s)}))},function(t){x[t?"unshift":"push"]((()=>{r=t,e(0,r)}))},function(t){x[t?"unshift":"push"]((()=>{a=t,e(1,a)}))}]}"function"==typeof HTMLElement&&(P=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const{on_mount:t}=this.$$;this.$$.on_disconnect=t.map(o).filter(r);for(const t in this.$$.slotted)this.appendChild(this.$$.slotted[t])}attributeChangedCallback(t,o,e){this[t]=e}disconnectedCallback(){n(this.$$.on_disconnect)}$destroy(){O(this,1),this.$destroy=t}$on(o,e){if(!r(e))return t;const n=this.$$.callbacks[o]||(this.$$.callbacks[o]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var o;this.$$set&&(o=t,0!==Object.keys(o).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}});class H extends P{constructor(t){super();const o=document.createElement("style");o.textContent="*{--button-bgcolor:var(--vp-c-text-1, var(--theme-foreground, black));--button-text-color:white;--popup-bgcolor:var(--vp-c-bg-elv, var(--theme-background, white));--popup-box-shadow:var(--vp-shadow-3, 0 12px 32px rgba(0, 0, 0, 0.1),\n      0 2px 6px rgba(0, 0, 0, 0.08));--popup-border-color:var(--vp-c-divider, var(--theme-foreground-faintest, #e1e1e1));--text-color-1:var(--theme-foreground-alt, var(--vp-c-text-1, black));--text-color-2:var(--vp-c-text-2, var(--theme-foreground-faint, #888888));--text-color-focus:var(--vp-c-brand-1, var(--theme-foreground-focus, #cccccc))}@media(prefers-color-scheme: dark){*{--button-text-color:black}}a{text-decoration:none;color:var(--text-color-1)}.button{background-color:var(--button-bgcolor);color:var(--button-text-color);font-weight:600;border-radius:9999px;font-size:14px;line-height:24px;text-decoration:none;cursor:pointer;width:fit-content;padding:4px 8px;height:32px;display:flex;align-items:center;justify-content:center;text-wrap:nowrap;overflow:hidden;box-sizing:border-box}.button-icon{display:flex;align-items:center}.button>div:first-child{padding-left:8px}.button:hover~.popup,.popup:hover{display:block}.popup{display:none;padding-top:0.5rem;position:absolute;right:0rem}.popup-wrapper{gap:20px;padding:20px;border-radius:10px;box-shadow:var(--popup-box-shadow);border:1px solid var(--popup-border-color);color:var(--text-color-1);background-color:var(--popup-bgcolor)}.popup-header{font-size:18px;line-height:27px;font-weight:600;border-bottom:1px solid var(--popup-border-color);padding-bottom:1rem}.popup-footer{font-size:14px;line-height:21px;font-weight:600;border-top:1px solid var(--popup-border-color);padding-top:1rem}.popup-footer a:hover{color:var(--text-color-focus)}.popup-content{display:flex;flex-direction:row;gap:40px;margin-bottom:20px}.popup a.section{display:block !important;text-wrap:wrap;width:260px;margin-top:20px;border-radius:8px;font-size:14px;line-height:21px;color:var(--text-color-2) !important}.popup a.section:hover h2{color:var(--text-color-focus)}.popup h2{font-weight:600;margin-bottom:4px;color:var(--text-color-1);font-size:16px;line-height:24px}a:hover,a:hover h2{transition:color 0.25s}@media screen and (max-width: 640px){.popup-content{flex-direction:column;gap:0px}.popup a.section{width:75vw}}",this.shadowRoot.appendChild(o),z(this,{target:this.shadowRoot,props:h(this.attributes),customElement:!0},q,S,a,{},null),t&&t.target&&s(t.target,this,t.anchor)}}customElements.define("made-by-observable",H);return new H}();
//# sourceMappingURL=made-by-observable.js.map