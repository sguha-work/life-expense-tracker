import{o as e}from"./rolldown-runtime-BENE6YOx.js";import{i as t}from"./framer-motion-DVKCDVWo.js";import{i as a,n as r,r as i,t as o}from"./goober-CkbiUOaz.js";var s=e(t(),1),n=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,l=(()=>{let e=0;return()=>(++e).toString()})(),d=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),c="default",u=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return u(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},p=[],m={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},f={},y=(e,t=c)=>{f[t]=u(f[t]||m,e),p.forEach(([e,a])=>{e===t&&a(f[t])})},h=e=>Object.keys(f).forEach(t=>y(e,t)),b=(e=c)=>t=>{y(t,e)},g={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},v=e=>(t,a)=>{let r=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||l()}))(t,e,a);return b(r.toasterId||(e=>Object.keys(f).find(t=>f[t].toasts.some(t=>t.id===e)))(r.id))({type:2,toast:r}),r.id},x=(e,t)=>v("blank")(e,t);x.error=v("error"),x.success=v("success"),x.loading=v("loading"),x.custom=v("custom"),x.dismiss=(e,t)=>{let a={type:3,toastId:e};t?b(t)(a):h(a)},x.dismissAll=e=>x.dismiss(void 0,e),x.remove=(e,t)=>{let a={type:4,toastId:e};t?b(t)(a):h(a)},x.removeAll=e=>x.remove(void 0,e),x.promise=(e,t,a)=>{let r=x.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?n(t.success,e):void 0;return i?x.success(i,{id:r,...a,...null==a?void 0:a.success}):x.dismiss(r),e}).catch(e=>{let i=t.error?n(t.error,e):void 0;i?x.error(i,{id:r,...a,...null==a?void 0:a.error}):x.dismiss(r)}),e};var w=(e,t="default")=>{let{toasts:a,pausedAt:r}=((e={},t=c)=>{let[a,r]=(0,s.useState)(f[t]||m),i=(0,s.useRef)(f[t]);(0,s.useEffect)(()=>(i.current!==f[t]&&r(f[t]),p.push([t,r]),()=>{let e=p.findIndex(([e])=>e===t);e>-1&&p.splice(e,1)}),[t]);let o=a.toasts.map(t=>{var a,r,i;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||g[t.type],style:{...e.style,...null==(i=e[t.type])?void 0:i.style,...t.style}}});return{...a,toasts:o}})(e,t),i=(0,s.useRef)(new Map).current,o=(0,s.useCallback)((e,t=1e3)=>{if(i.has(e))return;let a=setTimeout(()=>{i.delete(e),n({type:4,toastId:e})},t);i.set(e,a)},[]);(0,s.useEffect)(()=>{if(r)return;let e=Date.now(),i=a.map(a=>{if(a.duration===1/0)return;let r=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(!(r<0))return setTimeout(()=>x.dismiss(a.id,t),r);a.visible&&x.dismiss(a.id)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[a,r,t]);let n=(0,s.useCallback)(b(t),[t]),l=(0,s.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,s.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),u=(0,s.useCallback)(()=>{r&&n({type:6,time:Date.now()})},[r,n]),y=(0,s.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:i=8,defaultPosition:o}=t||{},s=a.filter(t=>(t.position||o)===(e.position||o)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+i,0)},[a]);return(0,s.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[a,o]),{toasts:a,handlers:{updateHeight:d,startPause:l,endPause:u,calculateOffset:y}}},E=o`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,k=o`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,$=o`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,D=a("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${E} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${k} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${$} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,C=o`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,I=a("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${C} 1s linear infinite;
`,z=o`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,j=o`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,A=a("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${j} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,O=a("div")`
  position: absolute;
`,P=a("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,N=o`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,M=a("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${N} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,T=({toast:e})=>{let{icon:t,type:a,iconTheme:r}=e;return void 0!==t?"string"==typeof t?s.createElement(M,null,t):t:"blank"===a?null:s.createElement(P,null,s.createElement(I,{...r}),"loading"!==a&&s.createElement(O,null,"error"===a?s.createElement(D,{...r}):s.createElement(A,{...r})))},H=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,L=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,R=a("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,S=a("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,U=s.memo(({toast:e,position:t,style:a,children:r})=>{let i=e.height?((e,t)=>{let a=e.includes("top")?1:-1,[r,i]=d()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[H(a),L(a)];return{animation:t?`${o(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${o(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},l=s.createElement(T,{toast:e}),c=s.createElement(S,{...e.ariaProps},n(e.message,e));return s.createElement(R,{className:e.className,style:{...i,...a,...e.style}},"function"==typeof r?r({icon:l,message:c}):s.createElement(s.Fragment,null,l,c))});r(s.createElement);var B=({id:e,className:t,style:a,onHeightUpdate:r,children:i})=>{let o=s.useCallback(t=>{if(t){let a=()=>{let a=t.getBoundingClientRect().height;r(e,a)};a(),new MutationObserver(a).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return s.createElement("div",{ref:o,className:t,style:a},i)},F=i`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Y=({reverseOrder:e,position:t="top-center",toastOptions:a,gutter:r,children:i,toasterId:o,containerStyle:l,containerClassName:c})=>{let{toasts:u,handlers:p}=w(a,o);return s.createElement("div",{"data-rht-toaster":o||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:c,onMouseEnter:p.startPause,onMouseLeave:p.endPause},u.map(a=>{let o=a.position||t,l=((e,t)=>{let a=e.includes("top"),r=a?{top:0}:{bottom:0},i=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:d()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...r,...i}})(o,p.calculateOffset(a,{reverseOrder:e,gutter:r,defaultPosition:t}));return s.createElement(B,{id:a.id,key:a.id,onHeightUpdate:p.updateHeight,className:a.visible?F:"",style:l},"custom"===a.type?n(a.message,a):i?i(a):s.createElement(U,{toast:a,position:o}))}))},q=x;export{q as n,Y as t};