// @vitest-environment node
import {beforeEach,describe,expect,it,vi} from "vitest";
import {readOwnAccount} from "@/lib/account/read";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({session:vi.fn()}));
vi.mock("@/lib/auth/server",()=>({getVerifiedSession:mocks.session}));
beforeEach(()=>vi.clearAllMocks());
describe("account reads a verified database session",()=>{
 it("returns anonymous without a session",async()=>{mocks.session.mockResolvedValue(null);expect(await readOwnAccount()).toBeNull();});
 it("returns only display fields and no authorization metadata",async()=>{mocks.session.mockResolvedValue({user:{id:"a",name:" Deniz ",email:"a@example.test",phone:" 05321234567 ",metadata:{role:"admin"}}});expect(await readOwnAccount()).toEqual({name:"Deniz",email:"a@example.test",phone:"05321234567"});});
 it("does not cache identity across requests",async()=>{mocks.session.mockResolvedValueOnce({user:{name:"A",email:"a@example.test"}}).mockResolvedValueOnce({user:{name:"B",email:"b@example.test"}});expect((await readOwnAccount())?.email).toBe("a@example.test");expect((await readOwnAccount())?.email).toBe("b@example.test");});
 it("bounds invalid display fields",async()=>{mocks.session.mockResolvedValue({user:{name:"a".repeat(101),email:null,phone:[]}});expect(await readOwnAccount()).toEqual({name:null,email:null,phone:null});});
 it("does not hide database verification failures as anonymous",async()=>{mocks.session.mockRejectedValue(new Error("auth_unavailable"));await expect(readOwnAccount()).rejects.toThrow("auth_unavailable");});
});


describe("restored account display and error regressions (186-2)",()=>{
 it.each([null,[],{},"", "a".repeat(101)])("bounds malformed account names without trusting metadata (%#)",async name=>{
  mocks.session.mockResolvedValue({user:{name,email:"safe@example.test",phone:null,metadata:{name:"forged",role:"admin"}}});
  expect(await readOwnAccount()).toEqual({name:null,email:"safe@example.test",phone:null});
 });
 it.each([null,[],{},"", "a".repeat(21)])("bounds malformed phone fields (%#)",async phone=>{
  mocks.session.mockResolvedValue({user:{name:"Safe Name",email:"safe@example.test",phone}});
  expect((await readOwnAccount())?.phone).toBeNull();
 });
 it.each([401,429,503])("does not turn a verified-session service error into a logged-in or anonymous success (%s)",async status=>{
  const error=Object.assign(new Error("safe-auth-failure"),{status});mocks.session.mockRejectedValue(error);
  await expect(readOwnAccount()).rejects.toBe(error);
 });
 it("never logs member data or private database errors",async()=>{
  const error=vi.spyOn(console,"error"),warn=vi.spyOn(console,"warn"),log=vi.spyOn(console,"log");
  mocks.session.mockRejectedValueOnce(new Error("private-database-credential"));
  await expect(readOwnAccount()).rejects.toThrow();
  expect(error).not.toHaveBeenCalled();expect(warn).not.toHaveBeenCalled();expect(log).not.toHaveBeenCalled();
  vi.restoreAllMocks();
 });
});
