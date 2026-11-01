import {findAddressOptions,parseAddressOptionsQuery} from '@/lib/contact/address-locations';

export const runtime='nodejs';
const publicHeaders={'Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'};
const invalid=()=>Response.json({error:'invalid_address_query'},{status:400,headers:{'Cache-Control':'no-store'}});

export function GET(request:Request):Response{
 // Only a bounded query over bundled public names is accepted. No credentials,
 // customer address, database lookup or upstream service is involved.
 if(request.url.length>2048)return invalid();
 let url:URL;try{url=new URL(request.url)}catch{return invalid()}
 const query=parseAddressOptionsQuery(url.searchParams);
 if(!query)return invalid();
 return Response.json({items:findAddressOptions(query)},{headers:publicHeaders});
}
