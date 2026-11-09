// @vitest-environment node
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { registrationConfirmation,registrationReady,validateRegisterRequest } from "@/lib/contracts/register";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({request:vi.fn(),email:vi.fn()}));
vi.mock("@/lib/auth/server",async original=>({...await original<typeof import("@/lib/auth/server")>(),authRequest:mocks.request}));
vi.mock("@/lib/auth/email",()=>({assertAuthEmailConfigured:mocks.email}));
const origin="https://afinazeytin.com",input={name:"  Deniz Test  ",email:"  Deniz@example.test  ",password:"Sofrada123!",privacy:true,consent:true,marketing:false};
function request(body:unknown=input,headers:HeadersInit={},raw=false){return new NextRequest(`${origin}/api/auth/register`,{method:"POST",headers:{origin,"content-type":"application/json",...headers},body:raw?String(body):JSON.stringify(body)});}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","test-secret-with-at-least-32-characters");mocks.request.mockResolvedValue(Response.json({user:{id:"member"}}));});
afterEach(()=>vi.unstubAllEnvs());
describe("registration validation", () => {
  it("normalizes name/email, preserves the password and defaults marketing to false", () => {
    const required = Object.fromEntries(Object.entries(input).filter(([key]) => key !== "marketing"));
    expect(validateRegisterRequest({ ...required, password: " Sofrada123! " })).toEqual({ ok: true, data: { ...input, name: "Deniz Test", email: "deniz@example.test", password: " Sofrada123! " } });
  });
  it.each([null, [], "email", 12, {}, { ...input, role: "admin" }, { ...input, marketing: "true" }, { ...input, email: 12 }, { ...input, name: {} }, { ...input, password: null }])("rejects malformed/unexpected values (%#)", body => {
    expect(validateRegisterRequest(body).ok).toBe(false);
  });
  it.each([
    ["name", "x"], ["name", "a".repeat(101)], ["email", "invalid"], ["email", "a".repeat(250) + "@example.test"],
    ["password", "short"], ["password", "lowercase123"], ["password", "UPPERCASE123"], ["password", "NoDigitsHere"], ["password", "Aa1" + "x".repeat(126)],
    ["privacy", false], ["privacy", "true"], ["consent", false], ["consent", 1],
  ])("reports the invalid %s field (%#)", (field, value) => {
    const result = validateRegisterRequest({ ...input, [field]: value });
    expect(result).toMatchObject({ ok: false, fields: { [field]: expect.any(String) } });
  });
});


describe("Better Auth registration compatibility",()=>{
 it("keeps confirmation contract without publishing a login cookie",async()=>{const response=await POST(request());expect(response.status).toBe(202);expect(await response.json()).toEqual({data:{status:"confirmation_required",message:registrationConfirmation}});expect(response.headers.getSetCookie()).toEqual([]);expect(mocks.request).toHaveBeenCalledWith(expect.any(Request),"/sign-up/email",{name:"Deniz Test",email:"deniz@example.test",password:input.password,callbackURL:"/hesabim",privacy:true,consent:true,marketing:false});});
 it("allows explicitly unverified registration without SMTP and without false email claims",async()=>{
  vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION","false");
  const response=await POST(request());expect(response.status).toBe(202);
  expect(await response.json()).toEqual({data:{status:"registered",message:registrationReady}});
  expect(mocks.email).not.toHaveBeenCalled();expect(mocks.request).toHaveBeenCalled();
 });
 it("uses the same confirmation message on duplicate accounts",async()=>{mocks.request.mockResolvedValue(Response.json({code:"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"},{status:422}));const response=await POST(request());expect(response.status).toBe(202);expect(await response.text()).toContain(registrationConfirmation);});
 it("reports missing SMTP before creating the account",async()=>{mocks.email.mockImplementationOnce(()=>{throw new Error();});const response=await POST(request());expect(response.status).toBe(503);expect(await response.text()).toContain("email_not_configured");expect(mocks.request).not.toHaveBeenCalled();});
 it.each([429,500,503])("sanitizes service failure %s",async status=>{mocks.request.mockResolvedValue(Response.json({message:"private"},{status}));const response=await POST(request());expect(response.status).toBe(status===429?429:503);expect(await response.text()).not.toContain("private");});
 it.each(["https://evil.test",""])("rejects CSRF %s",async origin=>{expect((await POST(request(input,{origin}))).status).toBe(403);expect(mocks.request).not.toHaveBeenCalled();});
 it("validates consent before auth",async()=>{expect((await POST(request({...input,consent:false}))).status).toBe(400);expect(mocks.request).not.toHaveBeenCalled();});
 it("bounds JSON and rejects unsupported media",async()=>{expect((await POST(request("{",{},true))).status).toBe(400);expect((await POST(request(input,{"content-type":"text/plain"}))).status).toBe(415);expect((await POST(request({...input,name:"x".repeat(9000)}))).status).toBe(413);expect(mocks.request).not.toHaveBeenCalled();});
});
