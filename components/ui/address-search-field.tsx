'use client';

import {useCallback,useLayoutEffect,useEffect,useId,useRef,useState,type CSSProperties,type KeyboardEvent} from 'react';
import './contact-fields.css';
import {ChevronDown} from 'lucide-react';
import type {ContactLanguage as Lang} from '@/lib/contact/language';

type Props={name:string;label:string;value:string;onChange:(value:string)=>void;kind:'city'|'district';city?:string;disabled?:boolean;placeholder:string;autoComplete:string;lang:Lang;invalid?:boolean;errorId?:string};
type Result={key:string;status:'loading'|'ready'|'error';items:string[]};
const emptyItems:string[]=[];
const copy={
 tr:{loading:'Yükleniyor…',empty:'Sonuç bulunamadı. Adresi yazarak devam edebilirsiniz.',error:'Liste yüklenemedi. Enter ile yeniden deneyebilir veya adresi yazabilirsiniz.',retry:'Yeniden dene',firstCity:'Önce il seçin.',show:'Seçenekleri aç',hide:'Seçenekleri kapat'},
 en:{loading:'Loading…',empty:'No matches. You can continue with the address you type.',error:'Unable to load options. Press Enter to retry or type the address.',retry:'Retry',firstCity:'Choose a city first.',show:'Show options',hide:'Close options'},
 ru:{loading:'Загрузка…',empty:'Ничего не найдено. Можно ввести адрес вручную.',error:'Не удалось загрузить список. Нажмите Enter для повтора или введите адрес.',retry:'Повторить',firstCity:'Сначала выберите город.',show:'Открыть список',hide:'Закрыть список'}
};

export function AddressSearchField({name,label,value,onChange,kind,city,disabled=false,placeholder,autoComplete,lang,invalid,errorId}:Props){
 const id=useId(),inputId=id+'-input',listId=id+'-options',statusId=id+'-status',hintId=id+'-hint',c=copy[lang];
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null);
 const waitingCity=kind==='district'&&!city?.trim(),unavailable=disabled||waitingCity;
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[retry,setRetry]=useState(0),[result,setResult]=useState<Result|null>(null);
 const [placement,setPlacement]=useState({side:'below' as 'above'|'below',height:260});
 const key=JSON.stringify([kind,kind==='district'?city||'':'',value]),shown=open&&!unavailable;
 const currentKey=useRef(key),opened=useRef(shown),generation=useRef(0),controller=useRef<AbortController|null>(null),pendingArrow=useRef<1|-1|null>(null);
 useLayoutEffect(()=>{currentKey.current=key;opened.current=shown;if(unavailable)pendingArrow.current=null},[key,shown,unavailable]);
 const current=result?.key===key?result:null,status=current?.status||'loading',items=current?.status==='ready'?current.items:emptyItems;
 const activeId=shown&&active>=0&&active<items.length?id+'-option-'+active:undefined;
 const message=status==='loading'?c.loading:status==='error'?c.error:!items.length?c.empty:'';

 const cancel=useCallback(()=>{generation.current++;controller.current?.abort();controller.current=null},[]);
 const close=useCallback(()=>{opened.current=false;cancel();setOpen(false);setActive(-1);pendingArrow.current=null},[cancel]);
 function choose(item:string){onChange(item);input.current?.focus({preventScroll:true});close()}
 function requestAgain(){cancel();input.current?.focus({preventScroll:true});setRetry(value=>value+1)}

 useEffect(()=>{
  if(!shown)return;
  const version=++generation.current,request=new AbortController();controller.current=request;
  let live=true,timeout:ReturnType<typeof setTimeout>|undefined,timedOut=false;
  const valid=()=>live&&version===generation.current&&currentKey.current===key&&opened.current;
  async function load(){
   if(!valid())return;
   setResult({key,status:'loading',items:[]});setActive(-1);
   timeout=setTimeout(()=>{timedOut=true;request.abort()},10000);
   try{
    const params=new URLSearchParams({kind,query:value});if(kind==='district')params.set('city',city||'');
    const response=await fetch('/api/address-options?'+params,{signal:request.signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('address-options');
    const body:unknown=await response.json();
    if(!body||typeof body!=='object'||!('items'in body)||!Array.isArray(body.items)||body.items.length>100||!body.items.every(item=>typeof item==='string'&&item.trim().length>0&&item.length<=80))throw Error('address-options');
    if(!valid()||request.signal.aborted)return;
    const next=[...new Set(body.items as string[])];setResult({key,status:'ready',items:next});
    const direction=pendingArrow.current;pendingArrow.current=null;if(direction&&next.length)setActive(direction===1?0:next.length-1);
   }catch{
    if(valid()&&(!request.signal.aborted||timedOut))setResult({key,status:'error',items:[]});
   }finally{if(timeout!==undefined)clearTimeout(timeout)}
  }
  const timer=setTimeout(()=>void load(),value.trim()?180:0);
  return()=>{live=false;clearTimeout(timer);if(timeout!==undefined)clearTimeout(timeout);request.abort();if(controller.current===request)controller.current=null};
 },[shown,key,retry,kind,city,value]);

 useEffect(()=>{
  if(!shown)return;
  const outside=(event:Event)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))close()};
  document.addEventListener('pointerdown',outside,true);document.addEventListener('focusin',outside);
  return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',outside)};
 // Closing uses only stable state setters and refs; a new query is not a new listener.
 },[shown,close]);

 useEffect(()=>{
  if(!shown)return;
  let frame=0;
  const measure=()=>{
   const element=input.current;if(!element)return;
   const box=element.getBoundingClientRect(),viewport=window.visualViewport;
   let top=viewport?.offsetTop||0,bottom=top+(viewport?.height||window.innerHeight);
   for(let parent=element.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
    if(/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY)){
     const rect=parent.getBoundingClientRect();top=Math.max(top,rect.top+parent.clientTop);bottom=Math.min(bottom,rect.top+parent.clientTop+parent.clientHeight);
    }
   }
   const below=bottom-box.bottom-8,above=box.top-top-8,side=below<180&&above>below?'above':'below',height=Math.max(48,Math.min(260,Math.floor(side==='above'?above:below)));
   setPlacement(previous=>previous.side===side&&previous.height===height?previous:{side,height});
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;measure()})};
  measure();window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,true);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  return()=>{if(frame)cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);window.removeEventListener('scroll',schedule,true);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule)};
 },[shown,items.length,status]);

 useEffect(()=>{if(shown&&active>=0)(list.current?.children[active] as HTMLElement|undefined)?.scrollIntoView({block:'nearest',inline:'nearest'})},[shown,active,key,items]);

 function keyboard(event:KeyboardEvent<HTMLInputElement>){
  if(event.nativeEvent.isComposing||unavailable)return;
  if(event.key==='Escape'&&shown){event.preventDefault();event.stopPropagation();close();return}
  if(event.key==='Tab'){if(shown)close();return}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();const direction=event.key==='ArrowDown'?1:-1;
   if(!shown||!items.length){pendingArrow.current=direction;setOpen(true);return}
   setActive(index=>direction===1?(index+1)%items.length:index<0?items.length-1:(index-1+items.length)%items.length);return;
  }
  if(event.key==='Enter'&&shown){event.preventDefault();if(status==='error')requestAgain();else if(active>=0&&items[active])choose(items[active]);else if(status==='ready')close()}
 }

 return <div ref={root} className="customer-address-combobox" data-open={shown?'true':undefined} data-kind={kind}>
  <label htmlFor={inputId}>{label}</label>
  <div className="customer-address-combobox-control">
   <input ref={input} id={inputId} name={name} value={value} onChange={event=>{cancel();pendingArrow.current=null;setActive(-1);setOpen(true);onChange(event.target.value)}} onFocus={()=>{if(!unavailable)setOpen(true)}} onBlur={event=>{if(event.relatedTarget instanceof Node&&!root.current?.contains(event.relatedTarget))close()}} onKeyDown={keyboard} placeholder={placeholder} autoComplete={autoComplete} required maxLength={80} disabled={unavailable} role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={shown} aria-controls={shown?listId:undefined} aria-activedescendant={activeId} aria-invalid={invalid||undefined} aria-describedby={[waitingCity?hintId:statusId,errorId].filter(Boolean).join(' ')}/>
   <button className="customer-address-toggle" type="button" tabIndex={-1} disabled={unavailable} aria-label={(shown?c.hide:c.show)+': '+label} aria-expanded={shown} aria-controls={shown?listId:undefined} onMouseDown={event=>event.preventDefault()} onClick={()=>{input.current?.focus({preventScroll:true});if(shown)close();else setOpen(true)}}><ChevronDown size={18} aria-hidden="true"/></button>
   {shown&&<div className="customer-address-options" data-side={placement.side} style={{'--address-options-max-height':placement.height+'px'} as CSSProperties}>
    <ul ref={list} id={listId} className="customer-address-options-list" role="listbox" aria-label={label} aria-busy={status==='loading'}>{items.map((item,index)=><li key={item} id={id+'-option-'+index} role="option" aria-selected={active===index||active===-1&&value===item} data-active={active===index?'true':undefined} onMouseDown={event=>event.preventDefault()} onPointerMove={event=>{if(event.pointerType==='mouse')setActive(index)}} onClick={()=>choose(item)}>{item}</li>)}</ul>
    {message&&<p className="customer-address-options-status" aria-hidden="true">{message}</p>}
    {status==='error'&&<button type="button" className="customer-address-retry" tabIndex={-1} onMouseDown={event=>event.preventDefault()} onClick={requestAgain}>{c.retry}</button>}
   </div>}
  </div>
  {waitingCity&&<small className="customer-address-combobox-hint" id={hintId}>{c.firstCity}</small>}
  <p className="customer-address-live" id={statusId} role="status" aria-live="polite" aria-atomic="true">{shown?message:''}</p>
 </div>;
}
