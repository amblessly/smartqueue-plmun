import{c as s,j as r}from"./createLucideIcon.B8TViTFL.js";import{h as n}from"./useSession.c0DFtuaf.js";import{L as o}from"./layout-grid.Dep4dg9f.js";import{T as c}from"./ticket.C3vX3R6A.js";import{r as i}from"./index.CVf8TyFT.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=s("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=s("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]]),w=[{href:"/dashboard",label:"Home",icon:u,match:e=>e==="/dashboard"||e==="/"},{href:"/services",label:"Services",icon:o,match:e=>e.startsWith("/services")||e.startsWith("/queue/request")},{href:"/queue",label:"My Queue",icon:c,match:e=>e==="/queue"||e.startsWith("/queue/ticket")}];function v(e,a){return a.match(e)}function k({className:e}){return r.jsxs("a",{href:"https://plmun.edu.ph/",target:"_blank",rel:"noreferrer",className:n("inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-bamboo-700",e),children:["Official PLMun website",r.jsx(h,{size:13,"aria-hidden":"true"})]})}function x(){const[e,a]=i.useState(()=>typeof window>"u"?"":window.location.pathname);return i.useEffect(()=>{const t=()=>a(window.location.pathname);return window.addEventListener("popstate",t),window.addEventListener("hashchange",t),()=>{window.removeEventListener("popstate",t),window.removeEventListener("hashchange",t)}},[]),e}export{w as N,k as O,v as i,x as u};
