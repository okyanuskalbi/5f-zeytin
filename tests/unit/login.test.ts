// @vitest-environment node
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { loginInvalidCredentials, magicLinkConfirmation,validateLoginRequest } from "@/lib/contracts/login";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({request:vi.fn(),email:vi.fn()}));
vi.mock("@/lib/auth/server",async original=>({...await original<typeof import("@/lib/auth/server")>(),authRequest:mocks.request}));
vi.mock("@/lib/auth/email",()=>({assertAuthEmailConfigured:mocks.email}));
const origin="https://afinazeytin.com",input={method:"password",email:" Deniz@example.test ",password:" Sofrada123! ",next:"/sepet"},magic={method:"magic_link",email:input.email,next:"/odeme"};
function request(body:unknown=input,headers:HeadersInit={},raw=false){return new NextRequest(`${origin}/api/auth/login`,{method:"POST",headers:{origin,"content-type":"application/json",...headers},body:raw?String(body):JSON.stringify(body)});}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","test-secret-with-at-least-32-characters");mocks.request.mockResolvedValue(Response.json({user:{id:"member"}}));});
afterEach(()=>vi.unstubAllEnvs());
describe("login contract", () => {
  it("normalizes email, preserves passwords and defaults the return path", () => {
    expect(validateLoginRequest({ ...input, next: undefined })).toEqual({ ok: true, data: { ...input, email: "deniz@example.test", next: "/hesabim" } });
    expect(validateLoginRequest(magic)).toEqual({ ok: true, data: { ...magic, email: "deniz@example.test" } });
  });
  it.each([null, [], "input", 2, {}, { ...input, method: "google" }, { ...input, email: 12 }, { ...input, password: null }, { ...input, next: [] }, { ...input, role: "admin" }, { ...magic, password: "ignored" }])("rejects malformed or unexpected input (%#)", value => {
    expect(validateLoginRequest(value).ok).toBe(false);
  });
  it.each([["email", "invalid"], ["email", "a".repeat(250) + "@example.test"], ["password", ""], ["password", "a".repeat(129)]])("validates %s (%#)", (key, value) => {
    expect(validateLoginRequest({ ...input, [key]: value })).toMatchObject({ ok: false, fields: { [key]: expect.any(String) } });
  });
  it("does not impose registration password complexity on an existing member", () => {
    expect(validateLoginRequest({ ...input, password: "x" }).ok).toBe(true);
  });
});


describe("Better Auth login compatibility",()=>{
 it("keeps the response contract and publishes Better Auth cookies only",async()=>{
  mocks.request.mockResolvedValue(Response.json({token:"opaque",user:{id:"member",email:"deniz@example.test"}},{headers:{"set-cookie":"better-auth.session_token=opaque; Path=/; HttpOnly; SameSite=Lax; Secure"}}));
  const response=await POST(request());expect(response.status).toBe(200);expect(await response.json()).toEqual({data:{status:"signed_in",redirectTo:"/sepet"}});
  expect(response.headers.getSetCookie()[0]).toMatch(/HttpOnly/);expect(mocks.request).toHaveBeenCalledWith(expect.any(Request),"/sign-in/email",{email:"deniz@example.test",password:input.password,callbackURL:"/sepet"});
 });
 it.each([400,401,403,422])("uses neutral wrong credential messages (%s)",async status=>{mocks.request.mockResolvedValue(Response.json({message:"private"},{status}));const response=await POST(request());expect(response.status).toBe(401);expect(await response.json()).toEqual({error:{code:"invalid_credentials",message:loginInvalidCredentials}});});
 it("preserves the magic link contract",async()=>{const response=await POST(request(magic));expect(response.status).toBe(202);expect(await response.json()).toEqual({data:{status:"link_requested",message:magicLinkConfirmation}});expect(mocks.request).toHaveBeenCalledWith(expect.any(Request),"/sign-in/magic-link",expect.objectContaining({callbackURL:"/odeme"}));});
 it("exposes missing mail setup without claiming delivery",async()=>{mocks.email.mockImplementationOnce(()=>{throw new Error();});const response=await POST(request(magic));expect(response.status).toBe(503);expect(await response.text()).toContain("email_not_configured");expect(mocks.request).not.toHaveBeenCalled();});
 it.each([429,500,503])("sanitizes service failures %s",async status=>{mocks.request.mockResolvedValue(Response.json({message:"private"},{status}));const response=await POST(request());expect(response.status).toBe(status===429?429:503);expect(await response.text()).not.toContain("private");});
 it.each(["https://evil.test",""])("rejects cross-site writes before auth %s",async origin=>{expect((await POST(request(input,{origin}))).status).toBe(403);expect(mocks.request).not.toHaveBeenCalled();});
 it("bounds JSON and rejects malformed input before auth",async()=>{for(const [body,headers,status] of [["{",{},400],["x",{"content-type":"text/plain"},415],[JSON.stringify({...input,password:"x".repeat(9000)}),{},413]] as const) expect((await POST(request(body,headers,true))).status).toBe(status);expect(mocks.request).not.toHaveBeenCalled();});
});
