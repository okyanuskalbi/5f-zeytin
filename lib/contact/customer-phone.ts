import {Metadata} from 'libphonenumber-js/core';
import metadataJson from 'libphonenumber-js/metadata.max.json';
import {AsYouType,parseDigits,getCountries,getCountryCallingCode,getExampleNumber,parsePhoneNumberFromString,type CountryCode} from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/mobile/examples';
import type {ContactLanguage as Lang} from './language';
export type PhoneParts={phoneCountry:CountryCode;phoneCode:string;phoneNational:string};
export const phoneCountries=getCountries();
export const phoneDigits=(value:string)=>parseDigits(value);
export function groupedNational(value:string,country:CountryCode){
 const digits=phoneDigits(value);if(!digits)return '';
 const national=new AsYouType(country).input(digits);
 if(/\D/.test(national)&&phoneDigits(national)===digits)return national;
 // International metadata also groups national numbers entered without a trunk prefix.
 const code=phoneCode(country),international=new AsYouType(country).input(code+digits).slice(code.length).trim();
 if(/\D/.test(international)&&phoneDigits(international)===digits)return international;
 // Keep incomplete/invalid input readable too, without accepting or dropping digits.
 const example=getExampleNumber(country,examples)?.formatInternational().slice(code.length).trim();
 const widths=example?.split(/\D+/).map(part=>part.length).filter(Boolean)||[3,3,3];
 const groups:string[]=[];let offset=0;
 for(const width of widths){if(offset>=digits.length)break;groups.push(digits.slice(offset,offset+width));offset+=width}
 if(offset<digits.length)groups.push(...digits.slice(offset).match(/.{1,3}/g)||[]);
 return groups.join(' ');
}
export function phoneCountry(value:unknown):CountryCode|undefined{return typeof value==='string'&&phoneCountries.includes(value as CountryCode)?value as CountryCode:undefined}
export const phoneCode=(country:CountryCode)=>'+'+getCountryCallingCode(country);
function contactPlan(country:CountryCode){
 const metadata=new Metadata(metadataJson);metadata.selectNumberingPlan(country);
 // The pinned max metadata includes machine/service numbers too. Customer contact
 // fields use fixed-line/mobile/VoIP/personal lengths, not the general maximum.
 return metadata.numberingPlan as NonNullable<typeof metadata.numberingPlan>&{type:(name:string)=>{possibleLengths:()=>number[]}|undefined;nationalPrefix:()=>string|undefined};
}
export function phoneLengths(country:CountryCode){const plan=contactPlan(country),lengths=['FIXED_LINE','MOBILE','VOIP','PERSONAL_NUMBER'].flatMap(type=>plan.type(type)?.possibleLengths()||[]);return [...new Set(lengths.length?lengths:plan.possibleLengths())].sort((a,b)=>a-b)}
export function phoneInputLimit(value:string,country:CountryCode){
 const digits=phoneDigits(value),prefix=contactPlan(country).nationalPrefix(),trunk=typeof prefix==='string'&&/^\d+$/.test(prefix)&&digits.startsWith(prefix)?prefix.length:0;
 return Math.max(...phoneLengths(country))+trunk;
}
export function phoneExample(country:CountryCode){return getExampleNumber(country,examples)?.nationalNumber||''}
export function countryPhoneOptions(lang:Lang){const names=new Intl.DisplayNames([lang],{type:'region'});return phoneCountries.map(country=>({country,name:names.of(country)||country,code:phoneCode(country)})).sort((a,b)=>a.name.localeCompare(b.name,lang))}
function countryKey(value:string){return value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/ı/g,'i').replace(/[.'’]/g,'').trim()}
export function findPhoneCountries(lang:Lang,query:string){
 const exact=query.trim()?(phoneCountry(query.trim().toUpperCase())||phoneCountryForAddress(query)):undefined,terms=countryKey(query).split(/\s+/).filter(Boolean),english=new Intl.DisplayNames(['en'],{type:'region'});
 return countryPhoneOptions(lang).filter(item=>exact?item.country===exact:terms.every(term=>{
  const digits=phoneDigits(term.replace(/^00/,''));
  if(/^[+\d٠-٩۰-۹]+$/.test(term)&&digits)return item.code.slice(1).startsWith(digits);
  return countryKey(item.name+' '+english.of(item.country)+' '+item.country).includes(term);
 }));
}
let countryNames:Map<string,CountryCode>|undefined;
export function phoneCountryForAddress(value:string){
 if(!countryNames){countryNames=new Map();for(const lang of ['tr','en','ru'] as const)for(const item of countryPhoneOptions(lang)){countryNames.set(countryKey(item.name),item.country);countryNames.set(countryKey(item.country),item.country)}for(const name of ['Turkey','Turkiye','Türkiye','TUR'])countryNames.set(countryKey(name),'TR');for(const name of ['UK','England','İngiltere','Great Britain'])countryNames.set(countryKey(name),'GB')}
 return countryNames.get(countryKey(value));
}
export function splitPhone(value:string,country:CountryCode='TR'){
 const text=value.trim().replace(/^00/,'+'),parsed=parsePhoneNumberFromString(text,{defaultCountry:country,extract:false});
 return{country:parsed?.country||country,national:parsed?.nationalNumber||phoneDigits(text)};
}
export function validPhoneParts(countryValue:unknown,nationalValue:unknown):PhoneParts|null{
 const country=phoneCountry(countryValue);if(!country||typeof nationalValue!=='string'||!/^\d{2,17}$/.test(nationalValue))return null;
 // Input is national; the country code belongs exclusively to the separate selector.
 const parsed=parsePhoneNumberFromString(phoneCode(country)+nationalValue,{extract:false});
 if(!parsed||parsed.ext||!parsed.isValid()||parsed.countryCallingCode!==getCountryCallingCode(country))return null;
 // A national trunk prefix is allowed; silently stripping a duplicated calling code is not.
 if(nationalValue!==parsed.nationalNumber&&nationalValue!==parsed.formatNational().replace(/\D/g,''))return null;
 return{phoneCountry:country,phoneCode:phoneCode(country),phoneNational:parsed.nationalNumber};
}
export function phoneText(parts:PhoneParts){return parsePhoneNumberFromString(parts.phoneCode+parts.phoneNational)?.formatInternational()||parts.phoneCode+' '+parts.phoneNational}
export function phoneForm(form:FormData,name:string){
 const national=phoneDigits(String(form.get(name)||'')),country=form.get(name+'Country');
 if(!national.trim())return{phone:''};
 const parts=validPhoneParts(country,national);if(!parts)throw new Error('Telefon numarasını ve ülke kodunu kontrol edin.');
 return{phone:phoneText(parts),...parts};
}
// Server-side validation: require the same country rules even if browser checks are bypassed.
// Preserve the representation of existing valid international strings to avoid changing old snapshots.
export function checkedPhone(value:Record<string,unknown>,optional=false):({phone:string}&Partial<PhoneParts>)|null{
 if(typeof value.phone!=='string')return null;if(optional&&value.phone==='')return{phone:''};
 if(value.phoneCountry!==undefined||value.phoneNational!==undefined||value.phoneCode!==undefined){
  const parts=validPhoneParts(value.phoneCountry,value.phoneNational);if(!parts||value.phoneCode!==parts.phoneCode)return null;
  const parsed=parsePhoneNumberFromString(value.phone,{extract:false});if(!parsed||parsed.number!==parts.phoneCode+parts.phoneNational)return null;
  return{phone:phoneText(parts),...parts};
 }
 if(!/^\+[\d ()-]{6,29}$/.test(value.phone))return null;
 const parsed=parsePhoneNumberFromString(value.phone,{extract:false});return parsed?.isValid()&&!parsed.ext?{phone:value.phone.trim()}:null;
}
export const phoneCopy={
 tr:{label:'Telefon',country:'Telefon ülke kodu',invalid:'Seçili ülkeye uygun geçerli bir telefon numarası girin.',digits:'hane',or:'veya'},
 en:{label:'Phone',country:'Phone country code',invalid:'Enter a valid phone number for the selected country.',digits:'digits',or:'or'},
 ru:{label:'Телефон',country:'Телефонный код страны',invalid:'Введите действительный номер для выбранной страны.',digits:'цифр',or:'или'}
};
export function phoneLengthHint(country:CountryCode,lang:Lang){const values=phoneLengths(country),text=values.length>3&&values.every((v,i)=>i===0||v===values[i-1]+1)?values[0]+'-'+values.at(-1):values.join(' '+phoneCopy[lang].or+' ');return text+' '+phoneCopy[lang].digits}
