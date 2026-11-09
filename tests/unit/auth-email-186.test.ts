// @vitest-environment node
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {assertAuthEmailConfigured,sendAuthEmail} from "@/lib/auth/email";
vi.mock("server-only",()=>({}));
const mocks=vi.hoisted(()=>({send:vi.fn(),close:vi.fn(),create:vi.fn()}));
vi.mock("nodemailer",()=>({default:{createTransport:mocks.create}}));
beforeEach(()=>{vi.clearAllMocks();for(const [name,value]of Object.entries({SMTP_HOST:"localhost",SMTP_PORT:"2525",SMTP_USER:"test",SMTP_PASSWORD:"test",SMTP_FROM:"test@example.test"}))vi.stubEnv(name,value);mocks.create.mockReturnValue({sendMail:mocks.send,close:mocks.close});mocks.send.mockResolvedValue({accepted:["member@example.test"],rejected:[]});});
afterEach(()=>vi.unstubAllEnvs());
it("does not silently succeed with missing SMTP",()=>{vi.stubEnv("SMTP_HOST","");expect(()=>assertAuthEmailConfigured()).toThrow("email_not_configured");expect(mocks.create).not.toHaveBeenCalled();});
it("requires secure transport and closes it after delivery",async()=>{await sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",subject:"AFİNA"});expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({requireTLS:true,secure:false}));expect(mocks.close).toHaveBeenCalledOnce();});
it("treats rejection as failure and closes the transport",async()=>{mocks.send.mockResolvedValue({accepted:[],rejected:["member@example.test"]});await expect(sendAuthEmail({to:"member@example.test",url:"https://afinazeytin.com/token",subject:"AFİNA"})).rejects.toThrow("email_delivery_failed");expect(mocks.close).toHaveBeenCalledOnce();});
