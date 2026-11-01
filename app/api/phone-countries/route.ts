import type {ContactLanguage as Lang} from '@/lib/contact/language';
import {findPhoneCountries} from '@/lib/contact/customer-phone';

export const runtime='nodejs';
export function GET(request:Request){
 const invalid=()=>Response.json({error:'invalid_country_query'},{status:400,headers:{'Cache-Control':'no-store'}});
 if(request.url.length>1024)return invalid();
 const params=new URL(request.url).searchParams,lang=params.get('lang')||'tr',query=params.get('query')||'';
 for(const key of params.keys())if(!['lang','query'].includes(key)||params.getAll(key).length!==1)return invalid();
 if(!['tr','en','ru'].includes(lang)||query.length>80||/[\u0000-\u001f\u007f\ufffd]/u.test(query))return invalid();
 // Search only bundled public country names/calling codes. No account, address,
 // database or external service is read and no form values are changed.
 return Response.json({items:findPhoneCountries(lang as Lang,query)},{headers:{'Cache-Control':'public, max-age=3600, s-maxage=86400'}});
}
