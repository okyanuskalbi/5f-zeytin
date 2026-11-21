// @vitest-environment node
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {assertAuthEmailConfigured,sendAuthEmail} from "@/lib/auth/email";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({send:vi.fn(),close:vi.fn(),connect:vi.fn()}));
vi.mock("worker-mailer",()=>({WorkerMailer:{connect:mocks.connect}}));
beforeEach(()=>{vi.clearAllMocks();for(const [name,value]of Object.entries({SMTP_HOST:"localhost",SMTP_PORT:"465",SMTP_USER:"test",SMTP_PASSWORD:"test",MAIL_FROM:"AFİNA ZEYTİN <test@example.test>"}))vi.stubEnv(name,value);mocks.connect.mockResolvedValue({send:mocks.send,close:mocks.close});mocks.send.mockResolvedValue(undefined);mocks.close.mockResolvedValue(undefined);});
afterEach(()=>vi.unstubAllEnvs());
it("does not silently succeed with missing SMTP",()=>{vi.stubEnv("SMTP_HOST","");expect(()=>assertAuthEmailConfigured()).toThrow("email_not_configured");expect(mocks.connect).not.toHaveBeenCalled();});
it("treats a missing password as not configured and never connects",async()=>{vi.stubEnv("SMTP_PASSWORD","");expect(()=>assertAuthEmailConfigured()).toThrow("email_not_configured");await expect(sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",kind:"reset"})).rejects.toThrow("email_not_configured");expect(mocks.connect).not.toHaveBeenCalled();});
it("uses implicit TLS on 465 and closes the connection after delivery",async()=>{await sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",kind:"verify"});expect(mocks.connect).toHaveBeenCalledWith(expect.objectContaining({host:"localhost",port:465,secure:true,startTls:false,credentials:{username:"test",password:"test"}}));expect(mocks.close).toHaveBeenCalledOnce();});
it("sends short Turkish text with the brand name and the link",async()=>{await sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",kind:"reset"});const mail=mocks.send.mock.calls[0][0];expect(mail.to).toEqual({email:"member@example.test"});expect(mail.text).toContain("https://afinazeytin.com/token");expect(mail.text).toContain("AFİNA ZEYTİN");expect(mail.subject).toBe("AFİNA ZEYTİN şifre sıfırlama");});
it("propagates a delivery failure and still closes the connection",async()=>{mocks.send.mockRejectedValue(new Error("rejected"));await expect(sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",kind:"magic"})).rejects.toThrow("rejected");expect(mocks.close).toHaveBeenCalledOnce();});
