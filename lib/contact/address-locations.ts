import locations from './turkey-address-locations.json';
const TURKISH_CITIES = locations.provinces.map(province => province.name).sort((a,b)=>a.localeCompare(b,'tr'));

export type AddressOptionsQuery={kind:'city'|'district';query:string;city?:string};
const maximumOptions=100;
const allowedParameters=new Set(['kind','query','city']);

function searchKey(value:string):string{
 return value.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/ı/g,'i').replace(/\s+/g,' ').trim();
}
const cities=TURKISH_CITIES.map(name=>({name,key:searchKey(name)}));
const districts=new Map(locations.provinces.map(province=>[
 searchKey(province.name),
 province.districts.map(district=>({name:district.name,key:searchKey(district.name)})).sort((a,b)=>a.name.localeCompare(b.name,'tr'))
]));

export function parseAddressOptionsQuery(params:URLSearchParams):AddressOptionsQuery|null{
 for(const key of params.keys())if(!allowedParameters.has(key)||params.getAll(key).length!==1)return null;
 const kind=params.get('kind'),query=params.get('query')??'',city=params.get('city')??undefined;
 if(kind!=='city'&&kind!=='district')return null;
 if([query,city].some(value=>value!==undefined&&(value.length>80||/[\u0000-\u001f\u007f\ufffd]/u.test(value))))return null;
 if(kind==='district'&&!city?.trim())return null;
 return{kind,query,...(city!==undefined?{city}:{} )};
}

export function findAddressOptions({kind,query,city}:AddressOptionsQuery):string[]{
 const key=searchKey(query),items=kind==='city'?cities:districts.get(searchKey(city||''))||[];
 return items.filter(item=>item.key.includes(key)).slice(0,maximumOptions).map(item=>item.name);
}
