'use client';

import {useEffect,useId,useLayoutEffect,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import {Check,ChevronDown,Search} from 'lucide-react';
import type {ContactLanguage as Lang} from '@/lib/contact/language';
import {phoneCountry,phoneCode,type countryPhoneOptions,type PhoneParts} from '@/lib/contact/customer-phone';
import './phone-country-search.css';

type Option=ReturnType<typeof countryPhoneOptions>[number];
type Result={key:string;status:'loading'|'ready'|'error';items:Option[]};
const copy={
 tr:{search:'Ülke veya kod ara',loading:'Yükleniyor…',empty:'Ülke bulunamadı.',retry:'Yeniden dene',error:'Ülke listesi yüklenemedi.'},
 en:{search:'Search country or code',loading:'Loading…',empty:'No countries found.',retry:'Retry',error:'Unable to load countries.'},
 ru:{search:'Найти страну или код',loading:'Загрузка…',empty:'Страны не найдены.',retry:'Повторить',error:'Не удалось загрузить страны.'}
};

export function PhoneCountrySearch({name,value,options,label,autoComplete,lang,onChange}:{name:string;value:PhoneParts['phoneCountry'];options:Option[];label:string;autoComplete:string;lang:Lang;onChange:(value:PhoneParts['phoneCountry'])=>void}){
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),select=useRef<HTMLSelectElement>(null),panel=useRef<HTMLDivElement>(null),search=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null),id=useId(),c=copy[lang];
 const[open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(-1),[result,setResult]=useState<Result|null>(null),[retry,setRetry]=useState(0),[position,setPosition]=useState({left:12,top:12,width:300,height:300});
 const key=JSON.stringify([lang,query]),current=result?.key===key?result:null,status=current?.status||'loading';
 const items=current?.status==='ready'?[...current.items].sort((a,b)=>Number(b.country===value)-Number(a.country===value)):[],selected=options.find(item=>item.country===value)!;
 function close(focus=false){setOpen(false);setActive(-1);if(focus)trigger.current?.focus({preventScroll:true})}
 function choose(item:Option){
  // Keep native form/autofill/change semantics while replacing its visible menu.
  if(select.current){select.current.value=item.country;select.current.dispatchEvent(new Event('change',{bubbles:true}))}
  close(true);
 }
 useLayoutEffect(()=>{
  if(!open)return;
  const node=panel.current;if(!node)return;
  if(typeof node.showPopover==='function')node.showPopover();else node.removeAttribute('popover');
  search.current?.focus({preventScroll:true});
  const outside=(event:Event)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))close()};
  document.addEventListener('pointerdown',outside,true);document.addEventListener('focusin',outside);
  return()=>{if(node.hidePopover&&node.matches(':popover-open'))node.hidePopover();document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',outside)};
 },[open]);
 useLayoutEffect(()=>{
  if(!open)return;
  let frame=0;
  const measure=()=>{
   const box=trigger.current?.getBoundingClientRect();if(!box)return;
   const view=window.visualViewport,left=view?.offsetLeft||0,top=view?.offsetTop||0,width=view?.width||innerWidth,height=view?.height||innerHeight,bottom=top+height;
   const below=bottom-box.bottom-8,above=box.top-top-8,rendered=Math.min(360,height-24,panel.current?.getBoundingClientRect().height||360),up=below<rendered&&above>below,w=Math.min(340,width-24),h=Math.min(360,height-24,Math.max(110,up?above:below)),actual=Math.min(h,rendered);
   setPosition({width:w,height:h,left:Math.max(left+12,Math.min(left+width-w-12,box.left)),top:Math.max(top+12,Math.min(bottom-actual-12,up?box.top-actual-8:box.bottom+8))});
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;measure()})};
  measure();window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  return()=>{if(frame)cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.removeEventListener('scroll',schedule,true);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule)};
 },[open,status,items.length]);
 useEffect(()=>{
  if(!open)return;
  const request=new AbortController();let live=true,timedOut=false,timeout:ReturnType<typeof setTimeout>|undefined;
  const timer=setTimeout(async()=>{
   setResult({key,status:'loading',items:[]});setActive(-1);
   timeout=setTimeout(()=>{timedOut=true;request.abort()},10000);
   try{
    const response=await fetch('/api/phone-countries?'+new URLSearchParams({lang,query}),{signal:request.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('country-options');
    const body:unknown=await response.json();
    if(!body||typeof body!=='object'||!('items'in body)||!Array.isArray(body.items)||body.items.length>245||!body.items.every(item=>item&&typeof item==='object'&&phoneCountry(item.country)&&item.code===phoneCode(item.country)&&typeof item.name==='string'&&item.name.length>0&&item.name.length<=100))throw Error('country-options');
    if(live&&!request.signal.aborted)setResult({key,status:'ready',items:body.items as Option[]});
   }catch{if(live&&(!request.signal.aborted||timedOut))setResult({key,status:'error',items:[]})}
   finally{if(timeout!==undefined)clearTimeout(timeout)}
  },query.trim()?180:0);
  return()=>{live=false;clearTimeout(timer);if(timeout!==undefined)clearTimeout(timeout);request.abort()};
 },[open,key,lang,query,retry]);
 useEffect(()=>{if(open&&active>=0)(list.current?.children[active] as HTMLElement|undefined)?.scrollIntoView({block:'nearest',inline:'nearest'})},[open,active]);
 function keyboard(event:KeyboardEvent<HTMLInputElement>){
  if(event.nativeEvent.isComposing)return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true)}
  else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(items.length)setActive(index=>event.key==='ArrowDown'?(index+1)%items.length:index<0?items.length-1:(index-1+items.length)%items.length)}
  else if(event.key==='Enter'){event.preventDefault();if(active>=0&&items[active])choose(items[active]);else if(items.length===1)choose(items[0]);else if(status==='error')setRetry(value=>value+1)}
 }
 const message=status==='loading'?c.loading:status==='error'?c.error:!items.length?c.empty:'';
 return <div ref={root} className="phone-country-search">
  <select ref={select} hidden name={name} value={value} onChange={event=>{const next=phoneCountry(event.target.value);if(next)onChange(next)}} autoComplete={autoComplete} tabIndex={-1} aria-hidden="true">{options.map(item=><option key={item.country} value={item.country}>{item.code} · {item.name}</option>)}</select>
  <button ref={trigger} type="button" className="phone-country-trigger" aria-label={label+': '+selected.code+' · '+selected.name} aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id:undefined} title={selected.code+' · '+selected.name} onClick={()=>{if(open)close();else{setQuery('');setOpen(true)}}} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setQuery('');setOpen(true)}}}><span dir="auto">{selected.code} · {selected.name}</span><ChevronDown size={16} aria-hidden="true"/></button>
  {open&&<div ref={panel} id={id} popover="manual" className="phone-country-panel" role="dialog" aria-label={label} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true)}}} style={{left:position.left,top:position.top,width:position.width,'--phone-country-height':position.height+'px'} as CSSProperties}>
   <div className="phone-country-query"><Search size={17} aria-hidden="true"/><input ref={search} type="search" role="combobox" aria-label={c.search} aria-autocomplete="list" aria-expanded="true" aria-controls={id+'-list'} aria-activedescendant={active>=0&&items[active]?id+'-'+items[active].country:undefined} aria-describedby={id+'-status'} placeholder={c.search} value={query} maxLength={80} autoComplete="off" onChange={event=>{event.stopPropagation();setQuery(event.target.value);setActive(-1)}} onKeyDown={keyboard}/></div>
   <ul ref={list} id={id+'-list'} role="listbox" aria-label={label} aria-busy={status==='loading'}>{items.map((item,index)=><li key={item.country} id={id+'-'+item.country} role="option" aria-selected={item.country===value} data-active={index===active||undefined} onMouseDown={event=>event.preventDefault()} onPointerMove={event=>{if(event.pointerType==='mouse')setActive(index)}} onClick={()=>choose(item)}><span>{item.name}</span><b dir="ltr">{item.code}</b>{item.country===value&&<Check size={16} aria-hidden="true"/>}</li>)}</ul>
   <p id={id+'-status'} role="status" aria-live="polite">{message}</p>{status==='error'&&<button type="button" className="phone-country-retry" onClick={()=>setRetry(value=>value+1)}>{c.retry}</button>}
  </div>}
 </div>;
}
