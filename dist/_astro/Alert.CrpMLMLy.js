import{c as n,j as e}from"./createLucideIcon.B8TViTFL.js";import{h as o}from"./useSession.BNK1JQck.js";import{C as d,I as m}from"./info.IlCeFz3r.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=n("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]),p={info:{wrap:"border-bamboo-200 bg-bamboo-50 text-bamboo-900",icon:"text-bamboo-600",Icon:m},warning:{wrap:"border-amber-200 bg-amber-50 text-amber-950",icon:"text-amber-600",Icon:b},error:{wrap:"border-red-200 bg-red-50 text-red-900",icon:"text-red-600",Icon:x},success:{wrap:"border-emerald-200 bg-emerald-50 text-emerald-950",icon:"text-emerald-600",Icon:d}};function f({tone:s="info",title:r,children:c,action:t,className:l}){const a=p[s],i=a.Icon;return e.jsxs("div",{role:s==="error"?"alert":"status",className:o("flex items-start gap-2.5 rounded-xl border px-3.5 py-3",a.wrap,l),children:[e.jsx(i,{size:16,className:o("mt-0.5 shrink-0",a.icon),"aria-hidden":"true"}),e.jsxs("div",{className:"min-w-0 flex-1 text-xs leading-relaxed",children:[r?e.jsx("p",{className:"font-bold",children:r}):null,e.jsx("div",{className:o(r&&"mt-0.5","opacity-90"),children:c})]}),t?e.jsx("div",{className:"shrink-0",children:t}):null]})}export{f as A,b as T};
