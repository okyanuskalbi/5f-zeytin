'use client';
import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type ChangeEvent} from 'react';
import './contact-fields.css';
import type {ContactLanguage as Lang} from '@/lib/contact/language';
import {PhoneCountrySearch} from './phone-country-search';
import {countryPhoneOptions,groupedNational,phoneDigits,phoneCopy,phoneCountry,phoneExample,phoneForm,phoneInputLimit,phoneLengthHint,splitPhone,validPhoneParts,type PhoneParts} from '@/lib/contact/customer-phone';
export {phoneForm};
export function CustomerPhoneField({name,initial='',initialParts,defaultCountry='TR',lang,required=true,autoComplete='shipping',onValueChange,invalid=false,errorId}:{name:string;initial?:string;initialParts?:Partial<PhoneParts>;defaultCountry?:string;lang:Lang;required?:boolean;autoComplete?:string;onValueChange?:(value:string)=>void;invalid?:boolean;errorId?:string}){
 const fallback=phoneCountry(defaultCountry)||'TR',start=splitPhone(initial,phoneCountry(initialParts?.phoneCountry)||fallback),[country,setCountry]=useState(phoneCountry(initialParts?.phoneCountry)||start.country),[national,setNational]=useState(groupedNational(initialParts?.phoneNational||start.national,phoneCountry(initialParts?.phoneCountry)||start.country)),[touched,setTouched]=useState(false);
 const selected=useRef(false),input=useRef<HTMLInputElement>(null),caret=useRef<number|null>(null),id=useId(),c=phoneCopy[lang],options=useMemo(()=>countryPhoneOptions(lang),[lang]);
 const valid=!national&&!required||!!validPhoneParts(country,phoneDigits(national)),error=touched&&!valid;
 useEffect(()=>{onValueChange?.(national ? options.find(option=>option.country===country)!.code+' '+national : '')},[country,national,options,onValueChange]);
 useEffect(()=>{input.current?.setCustomValidity(valid?'':c.invalid)},[valid,c.invalid]);
 useEffect(()=>{if(!selected.current&&!national)setCountry(fallback)},[fallback,national]);
 useLayoutEffect(()=>{if(caret.current!==null&&input.current){input.current.setSelectionRange(caret.current,caret.current);caret.current=null}},[national,country]);
 function change(event:ChangeEvent<HTMLInputElement>){
  const value=event.target.value,text=value.trim();
  if(text.startsWith('+')||text.startsWith('00')){const parsed=splitPhone(text,country);if(parsed.national.length>phoneInputLimit(parsed.national,parsed.country))return;const formatted=groupedNational(parsed.national,parsed.country);setCountry(parsed.country);setNational(formatted);caret.current=formatted.length;selected.current=true;return}
  let digits=phoneDigits(value),before=phoneDigits(value.slice(0,event.target.selectionStart??value.length)).length;
  const action=(event.nativeEvent as InputEvent).inputType;
  // Removing an inserted separator should remove the adjacent digit, not trap the cursor.
  if(digits===phoneDigits(national)){
   if(action==='deleteContentBackward'&&before>0){digits=digits.slice(0,before-1)+digits.slice(before);before--}
   else if(action==='deleteContentForward')digits=digits.slice(0,before)+digits.slice(before+1);
  }
  // Reject excess input as a whole: never silently turn a pasted wrong number
  // into a different valid contact. Deletion still repairs an old long value.
  if(digits.length>phoneInputLimit(digits,country)&&digits.length>=phoneDigits(national).length)return;
  const formatted=groupedNational(digits,country);let position=0,count=0;
  while(position<formatted.length&&count<before){if(phoneDigits(formatted[position]))count++;position++}
  caret.current=position;setNational(formatted);
 }
 function blur(){setTouched(true);const parsed=validPhoneParts(country,phoneDigits(national));if(parsed)setNational(groupedNational(parsed.phoneNational,country))}
 return <div className="customer-phone-field"><span className="customer-phone-label" id={id+'-label'}>{c.label}</span><div className="customer-phone-inputs">
  <PhoneCountrySearch name={name+'Country'} value={country} options={options} label={c.country} lang={lang} autoComplete={autoComplete+' tel-country-code'} onChange={next=>{selected.current=true;setCountry(next);setNational(groupedNational(national,next));caret.current=null;setTouched(false)}}/>
  <input ref={input} name={name} type="tel" inputMode="tel" value={national} onChange={change} onBlur={blur} onInvalid={()=>setTouched(true)} required={required} maxLength={30} placeholder={groupedNational(phoneExample(country),country)} aria-labelledby={id+'-label'} aria-describedby={id+'-hint'+(error?' '+id+'-error':'')+(errorId?' '+errorId:'')} aria-invalid={error||invalid||undefined} autoComplete={autoComplete+' tel-national'} dir="ltr"/>
 </div><small id={id+'-hint'}>{phoneLengthHint(country,lang)}</small>{error&&<small id={id+'-error'} className="customer-phone-error" role="alert">{c.invalid}</small>}</div>;
}
