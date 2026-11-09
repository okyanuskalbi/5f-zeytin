// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { localTestDatabaseUrl } from "../helpers/local-postgres";
vi.mock("server-only", () => ({}));
const mail = vi.hoisted(() => ({ messages: [] as Array<{to:string;text:string}> }));
vi.mock("nodemailer", () => ({default:{createTransport:()=>({sendMail:async(message:{to:string;text:string})=>{mail.messages.push(message);return {accepted:[message.to],rejected:[]};},close:()=>{}})}}));
const origin="https://afinazeytin.com", password="LocalSecure123!", email=`task186-auth-${crypto.randomUUID()}@example.test`, bypassEmail=`bypass-${crypto.randomUUID()}@example.test`, noMailEmail=`nomail-${crypto.randomUUID()}@example.test`, testIp="198.18.186.111";
let db: typeof import("@/lib/db"), auth: ReturnType<typeof import("@/lib/auth/better-auth").getAuth>;
let login:typeof import("@/app/api/auth/login/route").POST, register:typeof import("@/app/api/auth/register/route").POST;
let sessionHeaders:Headers;
const request=(path:string,body:unknown)=>new NextRequest(`${origin}${path}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":testIp},body:JSON.stringify(body)});
function cookies(response:Response) {return response.headers.getSetCookie().map(cookie=>cookie.split(";")[0]).join("; ");}
describe.skipIf(!process.env.TEST_DATABASE_URL)("Better Auth against local PostgreSQL",()=>{
beforeAll(async()=>{
 const url=localTestDatabaseUrl();
 vi.stubEnv("DATABASE_URL",url);vi.stubEnv("VERCEL","1");vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","task186-local-only-secret-32-characters-or-longer");
 vi.stubEnv("SMTP_HOST","localhost");vi.stubEnv("SMTP_PORT","2525");vi.stubEnv("SMTP_USER","test");vi.stubEnv("SMTP_PASSWORD","test");vi.stubEnv("SMTP_FROM","test@example.test");
 db=await import("@/lib/db");
 // A fresh test run must not inherit limits from earlier validation runs.
 await db.query('DELETE FROM "rateLimit" WHERE key LIKE $1',[`%${testIp}%`]);
 auth=(await import("@/lib/auth/better-auth")).getAuth();
 login=(await import("@/app/api/auth/login/route")).POST;register=(await import("@/app/api/auth/register/route")).POST;
});
afterAll(async()=>{
 const awaitKey=(await import("@/lib/auth/account-rate-limit")).accountLimitKey;
 if(db){await db.query('DELETE FROM "user" WHERE email=$1',[email]);await db.query('DELETE FROM "rateLimit" WHERE key LIKE $1',[`%${testIp}%`]);await db.query("DELETE FROM auth_account_limits WHERE key = ANY($1::text[])", [[email,bypassEmail,noMailEmail].map(value=> awaitKey(value,"task186-local-only-secret-32-characters-or-longer"))]);await db.closePool();}
 vi.unstubAllEnvs();
});
beforeEach(async()=>{
 await db.query("DELETE FROM auth_account_limits WHERE key = $1", [(await import("@/lib/auth/account-rate-limit")).accountLimitKey(email,"task186-local-only-secret-32-characters-or-longer")]);
});
 it("registers, confirms email, logs in, verifies DB session and signs out",async()=>{
  const registered=await register(request("/api/auth/register",{name:"Yerel Test",email,password,privacy:true,consent:true,marketing:false}));
  expect(registered.status,await registered.clone().text()).toBe(202);
  const persisted=await db.query('SELECT "emailVerified", metadata FROM "user" WHERE email=$1',[email]);
  expect(persisted.rows[0]).toMatchObject({emailVerified:false,metadata:{privacy_acknowledged:true,membership_consent:true,marketing_consent:false}});
  expect(registered.headers.getSetCookie()).toHaveLength(0);
  const message=mail.messages.find(message=>message.to===email);expect(message).toBeDefined();
  const url=message!.text.match(/https:\/\/[^\s]+/)![0];
  expect((await auth.handler(new Request(url))).status).toBeLessThan(400);
  const signedIn=await login(request("/api/auth/login",{method:"password",email,password,next:"/hesabim"}));
  expect(signedIn.status,await signedIn.clone().text()).toBe(200);
  expect(signedIn.headers.getSetCookie().join(" ")).toMatch(/HttpOnly/i);expect(signedIn.headers.getSetCookie().join(" ")).toMatch(/SameSite=Lax/i);
  sessionHeaders=new Headers({cookie:cookies(signedIn),origin});
  const {getVerifiedSession}=await import("@/lib/auth/server");
  const session=await getVerifiedSession(sessionHeaders);expect(session?.user.email).toBe(email);
  const sessions=await db.query('SELECT id FROM session WHERE "userId"=$1',[session!.user.id]);expect(sessions.rows.length).toBeGreaterThan(0);
  const logout=await (await import("@/app/auth/logout/route")).POST(new Request(`${origin}/auth/logout`,{method:"POST",headers:sessionHeaders}));
  expect(logout.status).toBe(204);expect(await getVerifiedSession(sessionHeaders)).toBeNull();
 });
 it("preserves profile and password changes and rejects direct validation bypasses",async()=>{
  const raw=(path:string,body:unknown,cookie="")=>auth.handler(new Request(`${origin}/api/auth${path}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":testIp,...(cookie?{cookie}:{})},body:JSON.stringify(body)}));
  for(const bad of [{name:"Bypass",email:bypassEmail,password,privacy:false,consent:true},{name:"Bypass",email:bypassEmail,password,privacy:true,consent:true,role:"admin"},{name:"Bypass",email:bypassEmail,password:"weak",privacy:true,consent:true}]) expect((await raw("/sign-up/email",bad)).status).toBe(400);
  expect((await db.query('SELECT id FROM "user" WHERE email=$1',[bypassEmail])).rows).toEqual([]);
  const signed=await login(request("/api/auth/login",{method:"password",email,password}));expect(signed.status).toBe(200);
  const cookie=cookies(signed);
  for(const bad of [{name:"Name",phone:"",email:"hijack@example.test"},{name:"Name",phone:"invalid"},{name:"x",phone:""}]) expect((await raw("/update-user",bad,cookie)).status).toBe(400);
  expect((await raw("/update-user",{name:"Updated Name",phone:"05321234567"},cookie)).status).toBe(200);
  expect((await db.query('SELECT name,phone,email FROM "user" WHERE email=$1',[email])).rows[0]).toMatchObject({name:"Updated Name",phone:"05321234567",email});
  expect((await raw("/change-password",{currentPassword:"Wrong123",newPassword:"NewLocalSecure456!"},cookie)).status).toBe(400);
  const changed=await raw("/change-password",{currentPassword:password,newPassword:"NewLocalSecure456!",revokeOtherSessions:true},cookie);expect(changed.status).toBe(200);
  // Restore the fixture password through the same verified-session flow.
  expect((await raw("/change-password",{currentPassword:"NewLocalSecure456!",newPassword:password,revokeOtherSessions:true},cookies(changed))).status).toBe(200);
 });
 it("delivers a single-use magic link and rejects replay",async()=>{
  const link=await login(request("/api/auth/login",{method:"magic_link",email,next:"/hesabim"}));expect(link.status).toBe(202);
  const message=mail.messages.filter(message=>message.to===email).at(-1)!;
  const url=message.text.match(/https:\/\/[^\s]+/)![0];
  expect(url).toContain("/magic-link/verify");
  const first=await auth.handler(new Request(url));expect(first.status).toBeLessThan(400);expect(cookies(first)).toContain("better-auth.session_token=");
  const second=await auth.handler(new Request(url));expect(second.headers.getSetCookie().join(" ")).not.toContain("better-auth.session_token=");
  expect(second.status>=400 || new URL(second.headers.get("location")!,origin).searchParams.has("error")).toBe(true);
 });
 it("rejects a wrong password and enforces a database-backed HTTP limit",async()=>{
  const wrong=await login(request("/api/auth/login",{method:"password",email,password:"WrongSecret123",next:"/hesabim"}));expect(wrong.status).toBe(401);
  const statuses=[];
  for(let i=0;i<6;i++) statuses.push((await login(request("/api/auth/login",{method:"password",email,password:"WrongSecret123",next:"/hesabim"}))).status);
  expect(statuses).toContain(429);
  expect((await db.query('SELECT count(*)::int AS count FROM "rateLimit"')).rows[0].count).toBeGreaterThan(0);
 });
 it("fails clearly when SMTP is missing without creating a token or user",async()=>{
  vi.stubEnv("SMTP_HOST","");
  const link=await login(request("/api/auth/login",{method:"magic_link",email}));expect(link.status).toBe(503);expect(await link.text()).toContain("email_not_configured");
  const signup=await register(request("/api/auth/register",{name:"Yerel Test",email:noMailEmail,password,privacy:true,consent:true,marketing:false}));expect(signup.status).toBe(503);
  expect((await db.query('SELECT id FROM "user" WHERE email=$1',[noMailEmail])).rows).toEqual([]);
 });
});
