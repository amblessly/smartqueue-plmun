import{c as s,j as e}from"./createLucideIcon.B8TViTFL.js";import{r as l}from"./index.CVf8TyFT.js";import{q as a}from"./queue-service.BV5pObKh.js";import{h as m}from"./useSession.c0DFtuaf.js";import{R as y}from"./rotate-ccw.BTMzAZie.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=s("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=s("FlaskConical",[["path",{d:"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2",key:"pzvekw"}],["path",{d:"M8.5 2h7",key:"csnxdl"}],["path",{d:"M7 16h10",key:"wp8him"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s("SkipForward",[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=s("ZapOff",[["path",{d:"M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317",key:"193nxd"}],["path",{d:"M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773",key:"27a7lr"}],["path",{d:"M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643",key:"1e0qe9"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=s("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function z({serviceId:o,className:c,onReset:u}){const[n,x]=l.useState(!1),[r,p]=l.useState(()=>typeof window>"u"?!0:a.isAutoAdvanceEnabled()),[d,i]=l.useState(null),b=()=>{o&&(a.advanceDemoQueue(o),i("Queue moved forward one step."))},h=()=>{const t=!r;a.setAutoAdvanceEnabled(t),p(t),i(t?"Auto-advance is on.":"Auto-advance is paused.")},f=()=>{window.confirm("Reset the simulated queues and notifications? Your session stays signed in.")&&(a.resetDemoQueue(),i("Demo queues were reset."),u?.())};return e.jsxs("div",{className:m("overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60",c),children:[e.jsxs("button",{type:"button",onClick:()=>x(t=>!t),"aria-expanded":n,className:"flex w-full items-center gap-2 px-3.5 py-2.5 text-left",children:[e.jsx(k,{size:14,className:"shrink-0 text-amber-700","aria-hidden":"true"}),e.jsx("span",{className:"min-w-0 flex-1 text-[0.6875rem] font-bold text-amber-900",children:"Prototype controls"}),e.jsx("span",{className:"hidden text-[0.5625rem] font-medium text-amber-700 sm:block",children:"Queue data is simulated"}),e.jsx(g,{size:15,className:m("shrink-0 text-amber-700 transition-transform",n&&"rotate-180"),"aria-hidden":"true"})]}),n?e.jsxs("div",{className:"border-t border-amber-200/70 px-3.5 py-3",children:[e.jsx("p",{className:"text-[0.625rem] leading-relaxed text-amber-900/80",children:"These controls stand in for staff actions. They only affect the simulated queues on this device."}),e.jsxs("div",{className:"mt-3 flex flex-wrap gap-2",children:[o?e.jsxs("button",{type:"button",onClick:b,className:"inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100",children:[e.jsx(w,{size:12})," Move queue"]}):null,e.jsxs("button",{type:"button",onClick:h,className:"inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100",children:[r?e.jsx(j,{size:12}):e.jsx(v,{size:12}),r?"Pause auto":"Resume auto"]}),e.jsxs("button",{type:"button",onClick:f,className:"inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[0.625rem] font-bold text-amber-900 transition-colors hover:bg-amber-100",children:[e.jsx(y,{size:12})," Reset demo"]})]}),d?e.jsx("p",{className:"mt-2 text-[0.625rem] font-semibold text-amber-800",role:"status",children:d}):null]}):null]})}export{g as C,z as D};
