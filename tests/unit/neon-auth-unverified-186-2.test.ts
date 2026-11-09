// @vitest-environment node
import {afterAll,beforeAll,describe,expect,it,vi} from "vitest";
import {NextRequest} from "next/server";
import {localTestDatabaseUrl} from "../helpers/local-postgres";
vi.mock("server-only",()=>({}));
const mail=vi.hoisted(()=>vi.fn());
vi.mock("nodemailer",()=>({default:{createTransport:mail}}));
const origin="https://afinazeytin.com",email=`temporary-${crypto.randomUUID()}@example.test`,password="ReadySecure123!",testIp="198.18.186.112";
let db: typeof import("@/lib/db");
const request=(path:string,body:unknown)=>new NextRequest(`${origin}/api/auth/${path}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":testIp},body:JSON.stringify(body)});
describe.skipIf(!process.env.TEST_DATABASE_URL)("temporary unverified membership against local Postgres",()=>{
 beforeAll(async()=>{
  vi.stubEnv("DATABASE_URL",localTestDatabaseUrl());vi.stubEnv("VERCEL","1");vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET","local-unverified-test-secret-at-least-32-characters");vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION","false");
  for(const key of ["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASSWORD","SMTP_FROM"])vi.stubEnv(key,"");
  db=await import("@/lib/db");await db.query('DELETE FROM "rateLimit" WHERE key LIKE $1',[`%${testIp}%`]);
 });
 afterAll(async()=>{if(db){await db.query('DELETE FROM "user" WHERE email=$1',[email]);await db.query("DELETE FROM auth_account_limits WHERE key=$1",[(await import("@/lib/auth/account-rate-limit")).accountLimitKey(email,"local-unverified-test-secret-at-least-32-characters")]);await db.closePool();}vi.unstubAllEnvs();});
 it("registers without SMTP, retains unverified status, and permits password login",async()=>{
  const register=(await import("@/app/api/auth/register/route")).POST;
  const registered=await register(request("register",{name:"Ready Member",email,password,privacy:true,consent:true,marketing:false}));
  expect(registered.status,await registered.clone().text()).toBe(202);
  expect(await registered.json()).toMatchObject({data:{status:"registered"}});expect(mail).not.toHaveBeenCalled();
  const result=await db.query('SELECT "emailVerified" FROM "user" WHERE email=$1',[email]);expect(result.rows[0].emailVerified).toBe(false);
  const login=(await import("@/app/api/auth/login/route")).POST;
  const signed=await login(request("login",{method:"password",email,password}));expect(signed.status,await signed.clone().text()).toBe(200);
  expect(signed.headers.getSetCookie().join(" ")).toContain("session_token");
 });
});
