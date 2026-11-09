// @vitest-environment node
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {GET as callback} from "@/app/auth/callback/route";
import {logout,getVerifiedUser,getVerifiedSession,assertAuthMutation,authFailure,authRequest} from "@/lib/auth/server";
import {getAuthConfig} from "@/lib/auth/server-config";
import {getAuthCookieOptions,safeAuthRedirect} from "@/lib/auth/config";
import {proxy} from "@/proxy";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({session:vi.fn(),handler:vi.fn(),headers:vi.fn()}));
vi.mock("@/lib/auth/better-auth",()=>({getAuth:()=>({api:{getSession:mocks.session},handler:mocks.handler})}));
vi.mock("next/headers",()=>({headers:mocks.headers}));
const origin="https://afinazeytin.com";
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","test-secret-with-at-least-32-characters");mocks.headers.mockResolvedValue(new Headers({cookie:"better-auth.session_token=opaque"}));mocks.session.mockResolvedValue({user:{id:"member",email:"member@example.test",emailVerified:true}});mocks.handler.mockResolvedValue(Response.json({success:true}));});
afterEach(()=>vi.unstubAllEnvs());
describe("Better Auth core trust boundaries",()=>{
 it("requires configured origin and long server secret",()=>{expect(getAuthConfig().siteOrigin).toBe(origin);vi.stubEnv("BETTER_AUTH_SECRET","short");expect(()=>getAuthConfig()).toThrow("Auth configuration unavailable");});
 it.each(["https://user:secret@example.test","https://example.test/path","https://example.test?x=1","http://example.test","null"])("rejects unsafe origins %s",value=>{vi.stubEnv("BETTER_AUTH_URL",value);expect(()=>getAuthConfig()).toThrow();});
 it("keeps cookies HttpOnly and redirects constrained",()=>{vi.stubEnv("NODE_ENV","production");expect(getAuthCookieOptions()).toEqual({path:"/",httpOnly:true,secure:true,sameSite:"lax"});expect(safeAuthRedirect("https://evil.test")).toBe("/hesabim");});
 it("validates database sessions rather than trusting profile cookies",async()=>{expect(await getVerifiedUser()).toEqual({id:"member",email:"member@example.test"});expect(mocks.session).toHaveBeenCalledWith({headers:expect.any(Headers),query:{disableCookieCache:true}});mocks.session.mockResolvedValue(null);expect(await getVerifiedUser()).toBeNull();});
 it("does not open auth without a cookie",async()=>{expect(await getVerifiedSession(new Headers())).toBeNull();expect(mocks.session).not.toHaveBeenCalled();});
 it("sanitizes database failures",async()=>{mocks.session.mockRejectedValue(new Error("private connection"));await expect(getVerifiedUser()).rejects.toMatchObject({status:503,message:"auth_unavailable"});expect(authFailure({status:429})).toMatchObject({status:429,retryAfter:60});});
 it("rejects CSRF and invalid methods",()=>{expect(()=>assertAuthMutation(new Request(origin,{method:"POST",headers:{origin:"https://evil.test"}}))).toThrow();expect(()=>assertAuthMutation(new Request(origin))).toThrow();});
 it("forwards mutation through HTTP handler for DB rate limiting",async()=>{await authRequest(new Request("https://internal.test",{headers:{origin}}),"/sign-in/email",{email:"a@example.test",password:"private"});const req=mocks.handler.mock.calls[0][0] as Request;expect(req.url).toBe(`${origin}/api/auth/sign-in/email`);expect(req.method).toBe("POST");});
 it("logs out current session and publishes only returned deletion cookies",async()=>{mocks.handler.mockResolvedValue(Response.json({success:true},{headers:{"set-cookie":"better-auth.session_token=; Path=/; HttpOnly; Max-Age=0"}}));const result=await logout(new Request(`${origin}/auth/logout`,{method:"POST",headers:{origin,cookie:"better-auth.session_token=opaque"}}));expect(result.status).toBe(204);expect(result.headers.getSetCookie()[0]).toMatch(/HttpOnly/);});
 it("requires a valid session on the legacy callback and rejects old codes",async()=>{expect((await callback(new Request(`${origin}/auth/callback?code=legacy`))).status).toBe(400);const result=await callback(new Request(`${origin}/auth/callback?next=//evil.test`,{headers:{cookie:"better-auth.session_token=opaque"}}));expect(result.status).toBe(303);expect(result.headers.get("location")).toBe(`${origin}/hesabim`);});
 it("uses proxy as an optimistic cookie gate only",async()=>{const anonymous=await proxy(new NextRequest(`${origin}/hesabim`));expect(anonymous.status).toBe(307);const present=await proxy(new NextRequest(`${origin}/hesabim`,{headers:{cookie:"better-auth.session_token=forged"}}));expect(present.status).toBe(200);expect(mocks.session).not.toHaveBeenCalled();});
});
