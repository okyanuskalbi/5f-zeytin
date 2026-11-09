// @vitest-environment node
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import { requireEmailVerification } from "@/lib/auth/server-config";
import { consumeAccountAttempt, accountLimitKey } from "@/lib/auth/account-rate-limit";
import { query } from "@/lib/db";
vi.mock("server-only",()=>({}));
vi.mock("@/lib/db",()=>({query:vi.fn()}));
beforeEach(()=>{vi.clearAllMocks();vi.mocked(query).mockResolvedValue({rows:[{retry_after:0}]} as never);});
afterEach(()=>vi.unstubAllEnvs());
describe("email verification policy",()=>{
 it.each([undefined,"","true"])("requires verification by default or true (%s)",value=>{vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION",value);expect(requireEmailVerification()).toBe(true);});
 it("permits only explicit false",()=>{vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION","false");expect(requireEmailVerification()).toBe(false);});
 it.each(["FALSE","0","1","unknown"])("fails closed on malformed flag %s",value=>{vi.stubEnv("AUTH_REQUIRE_EMAIL_VERIFICATION",value);expect(()=>requireEmailVerification()).toThrow();});
});
describe("shared account attempt limit",()=>{
 const secret="local-identity-counter-secret";
 it("normalizes identities and stores only keyed hashes",async()=>{
  expect(accountLimitKey(" A@Example.test ",secret)).toBe(accountLimitKey("a@example.test",secret));
  expect(accountLimitKey("a@example.test",secret)).not.toContain("a@example.test");
  expect(accountLimitKey("a@example.test",secret)).not.toBe(accountLimitKey("a@example.test","different-key"));
  await consumeAccountAttempt(" A@Example.test ",secret);
  expect(query).toHaveBeenCalledWith(expect.stringContaining("ON CONFLICT"),[accountLimitKey("a@example.test",secret)]);
 });
 it("returns the database wait without sleeping a worker",async()=>{vi.mocked(query).mockResolvedValue({rows:[{retry_after:20}]} as never);expect(await consumeAccountAttempt("a@example.test",secret)).toBe(20);});
 it.each([null,[],{},"not-email",""])("does not create counters for malformed identity %#",async email=>{expect(await consumeAccountAttempt(email,secret)).toBe(0);expect(query).not.toHaveBeenCalled();});
 it("does not fail open when storage is unavailable",async()=>{vi.mocked(query).mockRejectedValue(new Error("private-db"));await expect(consumeAccountAttempt("a@example.test",secret)).rejects.toThrow();});
});
