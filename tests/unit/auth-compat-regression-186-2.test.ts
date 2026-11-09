// @vitest-environment node
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {POST as login} from "@/app/api/auth/login/route";
import {POST as register} from "@/app/api/auth/register/route";
import {logout} from "@/lib/auth/server";
import {safeAuthRedirect} from "@/lib/auth/config";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({request:vi.fn(),handler:vi.fn(),email:vi.fn()}));
vi.mock("@/lib/auth/server",async original=>({...await original<typeof import("@/lib/auth/server")>(),authRequest:mocks.request}));
vi.mock("@/lib/auth/better-auth",()=>({getAuth:()=>({handler:mocks.handler})}));
vi.mock("@/lib/auth/email",()=>({assertAuthEmailConfigured:mocks.email}));
const origin="https://afinazeytin.com",email="member@example.test",password="ReadySecure123!";
const loginBody={method:"password",email,password,next:"/hesabim"};
const registration={name:"Member Name",email,password,privacy:true,consent:true,marketing:false};
function request(path:string,body:unknown,headers:HeadersInit={}){return new NextRequest(`${origin}${path}`,{method:"POST",headers:{origin,"content-type":"application/json",...headers},body:JSON.stringify(body)});}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","compat-regression-local-secret-32-characters");mocks.request.mockResolvedValue(Response.json({user:{id:"member",email},token:"opaque"},{headers:{"set-cookie":"better-auth.session_token=signed; HttpOnly; SameSite=Lax"}}));});
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
describe("restored provider-independent authentication regressions",()=>{
 it.each(["/hesabim","/hesabim/siparisler","/hesabim/adresler","/hesabim/bilgilerim","/hesabim/guvenlik","/sepet","/odeme"])("retains allowed destination %s",path=>{expect(safeAuthRedirect(path)).toBe(path);});
 it.each(["https://evil.test","//evil.test","/admin","/hesabim/../admin","/hesabim?next=https://evil.test","/hesabim#private","/hesabim%2fadmin",null,""])("rejects unsafe return destination %#",path=>{expect(safeAuthRedirect(path)).toBe("/hesabim");});
 it.each(["cross-site","same-site","none"])("rejects fetch site %s before any auth transport",async site=>{
  for(const [handler,path,body]of [[login,"/api/auth/login",loginBody],[register,"/api/auth/register",registration]] as const){expect((await handler(request(path,body,{"sec-fetch-site":site}))).status).toBe(403);}
  expect(mocks.request).not.toHaveBeenCalled();
 });
 it("does not trust a matching forwarded host when the origin is wrong",async()=>{expect((await login(request("/api/auth/login",loginBody,{origin:"https://evil.test","x-forwarded-host":"afinazeytin.com","x-forwarded-proto":"https"}))).status).toBe(403);expect(mocks.request).not.toHaveBeenCalled();});
 it("does not publish success or deletion cookies on login/registration transport failure",async()=>{
  const error=vi.spyOn(console,"error").mockImplementation(()=>{});const warn=vi.spyOn(console,"warn").mockImplementation(()=>{});
  mocks.request.mockRejectedValue(new Error("private-password-and-host"));
  for(const [handler,path,body]of [[login,"/api/auth/login",loginBody],[register,"/api/auth/register",registration]] as const){const response=await handler(request(path,body));expect(response.status).toBe(503);expect(response.headers.getSetCookie()).toEqual([]);expect(await response.text()).not.toContain("private-password-and-host");}
  expect(error).not.toHaveBeenCalled();expect(warn).not.toHaveBeenCalled();
 });
 it.each([null, {}, {token:"opaque"}, {token:"opaque",user:{id:"member",email:"other@example.test"}}])("rejects malformed or mismatched successful authentication responses %#",async body=>{
  mocks.request.mockResolvedValue(Response.json(body,{headers:{"set-cookie":"better-auth.session_token=signed; HttpOnly; SameSite=Lax"}}));
  const response=await login(request("/api/auth/login",loginBody));expect(response.status).toBe(503);expect(response.headers.getSetCookie()).toEqual([]);
 });
 it.each([null,"better-auth.session_token=; Max-Age=0","other-cookie=signed; HttpOnly","better-auth.session_token=signed"])("does not claim login without an issued private session cookie %#",async cookie=>{
  mocks.request.mockResolvedValue(Response.json({token:"opaque",user:{id:"member",email}},{headers:cookie?{"set-cookie":cookie}:{}}));
  expect((await login(request("/api/auth/login",loginBody))).status).toBe(503);
 });
 it("retains a field error for native provider password policy rejection",async()=>{
  mocks.request.mockResolvedValue(Response.json({code:"WEAK_PASSWORD",message:"private-policy"},{status:400}));
  const response=await register(request("/api/auth/register",registration));expect(response.status).toBe(422);expect(await response.json()).toMatchObject({error:{code:"validation_error",fields:{password:expect.any(String)}}});
 });
 it.each([429,500,503])("does not clear session cookies when logout fails (%s)",async status=>{
  mocks.handler.mockResolvedValue(Response.json({message:"private-token"},{status,headers:{"set-cookie":"better-auth.session_token=; Max-Age=0"}}));
  const response=await logout(new Request(`${origin}/auth/logout`,{method:"POST",headers:{origin,cookie:"better-auth.session_token=keep"}}));
  expect(response.status).toBe(status===429?429:503);expect(response.headers.getSetCookie()).toEqual([]);expect(await response.text()).not.toContain("private-token");
 });
 it("preserves the progressive server wait in both compatibility routes",async()=>{
  for(const [handler,path,body]of [[login,"/api/auth/login",loginBody],[register,"/api/auth/register",registration]] as const){mocks.request.mockResolvedValue(Response.json({code:"ACCOUNT_RATE_LIMITED"},{status:429,headers:{"retry-after":"20"}}));const response=await handler(request(path,body));expect(response.status).toBe(429);expect(response.headers.get("retry-after")).toBe("20");}
 });
});
