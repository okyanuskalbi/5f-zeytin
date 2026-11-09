// @vitest-environment node
import {afterAll,beforeAll,beforeEach,describe,expect,it,vi} from "vitest";
import {localTestDatabaseUrl} from "../helpers/local-postgres";
import {accountLimitKey,consumeAccountAttempt} from "@/lib/auth/account-rate-limit";
import {query,closePool} from "@/lib/db";
vi.mock("server-only",()=>({}));
const secret="local-account-test-secret-at-least-32-characters",email=`limits-${crypto.randomUUID()}@example.test`,origin="https://afinazeytin.com";
const testIps=[10,11,12,13,100,101,102,103,104,105,210,211].map(value=>`%198.18.186.${value}%`);
let ready=false;
describe.skipIf(!process.env.TEST_DATABASE_URL)("shared account counters against local Postgres",()=>{
 beforeAll(async()=>{vi.stubEnv("DATABASE_URL",localTestDatabaseUrl());vi.stubEnv("BETTER_AUTH_URL",origin);vi.stubEnv("BETTER_AUTH_SECRET",secret);vi.stubEnv("VERCEL","1");vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION","false");ready=true;await query('DELETE FROM "rateLimit" WHERE key LIKE ANY($1::text[])',[testIps]);});
 beforeEach(async()=>{await query("DELETE FROM auth_account_limits WHERE key=$1",[accountLimitKey(email,secret)]);});
 afterAll(async()=>{if(ready){await query("DELETE FROM auth_account_limits WHERE key=$1",[accountLimitKey(email,secret)]);await query('DELETE FROM "rateLimit" WHERE key LIKE ANY($1::text[])',[testIps]);await closePool();}vi.unstubAllEnvs();});
 it("allows five attempts, then progressive waits with an allowed retry after each expiry",async()=>{
  for(let i=0;i<5;i++)expect(await consumeAccountAttempt(email,secret)).toBe(0);
  expect(await consumeAccountAttempt(email,secret)).toBe(5);
  expect(await consumeAccountAttempt(email,secret)).toBe(5);
  expect((await query("SELECT attempts FROM auth_account_limits WHERE key=$1",[accountLimitKey(email,secret)])).rows[0].attempts).toBe(6);
  await query("UPDATE auth_account_limits SET blocked_until=CURRENT_TIMESTAMP-interval '1 second' WHERE key=$1",[accountLimitKey(email,secret)]);
  expect(await consumeAccountAttempt(email,secret)).toBe(0);
  expect(await consumeAccountAttempt(email,secret)).toBe(10);
  await query("UPDATE auth_account_limits SET blocked_until=CURRENT_TIMESTAMP-interval '1 second' WHERE key=$1",[accountLimitKey(email,secret)]);
  expect(await consumeAccountAttempt(email,secret)).toBe(0);expect(await consumeAccountAttempt(email,secret)).toBe(20);
  await query("UPDATE auth_account_limits SET window_started=CURRENT_TIMESTAMP-interval '16 minutes' WHERE key=$1",[accountLimitKey(email,secret)]);
  expect(await consumeAccountAttempt(email,secret)).toBe(0);
 });
 it("serializes concurrent attempts and keeps different identities independent",async()=>{
  const outcomes=await Promise.all(Array.from({length:10},()=>consumeAccountAttempt(email,secret)));
  expect(outcomes.filter(value=>value===0)).toHaveLength(5);expect(outcomes.filter(value=>value===5)).toHaveLength(5);
  const other=`other-${email}`;try{expect(await consumeAccountAttempt(other,secret)).toBe(0);}finally{await query("DELETE FROM auth_account_limits WHERE key=$1",[accountLimitKey(other,secret)]);}
 });
 it("limits an account even when each login comes from a different IP",async()=>{
  const auth=(await import("@/lib/auth/better-auth")).getAuth();
  const statuses=[];
  for(let i=0;i<6;i++) statuses.push((await auth.handler(new Request(`${origin}/api/auth/sign-in/email`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":`198.18.186.${100+i}`},body:JSON.stringify({email,password:"WrongSecure123!"})}))).status);
  expect(statuses.slice(0,5)).toEqual([401,401,401,401,401]);expect(statuses[5]).toBe(429);
 });
 it("uses the same recovery token precedence as the provider",async()=>{
  const id=crypto.randomUUID(),token=crypto.randomUUID(),verification=crypto.randomUUID();
  try {
   await query('INSERT INTO "user"(id,name,email,"emailVerified") VALUES($1,$2,$3,true)',[id,"Limit Member",email]);
   await query(`INSERT INTO verification(id,identifier,value,"expiresAt") VALUES($1,$2,$3,CURRENT_TIMESTAMP+interval '1 hour')`,[verification,`reset-password:${token}`,id]);
   for(let i=0;i<6;i++)await consumeAccountAttempt(email,secret);
   const auth=(await import("@/lib/auth/better-auth")).getAuth();
   const response=await auth.handler(new Request(`${origin}/api/auth/reset-password?token=${token}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":"198.18.186.210"},body:JSON.stringify({token:"",newPassword:"ResetSecure123!"})}));
   expect(response.status,await response.clone().text()).toBe(429);
  } finally {await query('DELETE FROM verification WHERE id=$1',[verification]);await query('DELETE FROM "user" WHERE id=$1',[id]);}
 });
 it("does not expose or log raw storage failures from any account-limit query",async()=>{
  const db=await import("@/lib/db");const log=vi.spyOn(console,"error").mockImplementation(()=>{});
  const spy=vi.spyOn(db,"query").mockRejectedValue(new Error("postgres://private:password@private-host/database"));
  try {
   const auth=(await import("@/lib/auth/better-auth")).getAuth();
   for(const [path,body]of [["/sign-in/email",{email,password:"WrongSecure123!"}],["/reset-password?token=sample",{token:"",newPassword:"ResetSecure123!"}]] as const){
    const response=await auth.handler(new Request(`${origin}/api/auth${path}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":"198.18.186.211"},body:JSON.stringify(body)}));
    expect(response.status).toBe(503);expect(await response.text()).not.toContain("private");
   }
   expect(log).not.toHaveBeenCalled();
  } finally {spy.mockRestore();log.mockRestore();}
 });
 it.each(["/sign-in/email","/sign-up/email","/request-password-reset","/sign-in/magic-link"])("enforces account limit despite a different client IP on %s",async path=>{
  for(let i=0;i<6;i++)await consumeAccountAttempt(email,secret);
  const auth=(await import("@/lib/auth/better-auth")).getAuth();
  const body=path==="/sign-up/email"?{email,name:"Limit Member",password:"LocalSecure123!",privacy:true,consent:true,marketing:false}:{email,password:"LocalSecure123!"};
  const response=await auth.handler(new Request(`${origin}/api/auth${path}`,{method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":`198.18.186.${10+["/sign-in/email","/sign-up/email","/request-password-reset","/sign-in/magic-link"].indexOf(path)}`},body:JSON.stringify(body)}));
  expect(response.status,await response.clone().text()).toBe(429);expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);expect(await response.text()).not.toContain(email);
 });
});
