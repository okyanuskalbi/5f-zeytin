import {cleanup,fireEvent,render,screen,waitFor} from "@testing-library/react";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {ConfiguredGoogleButton} from "@/components/account/ConfiguredGoogleButton";
const fetchMock=vi.fn();
beforeEach(()=>{fetchMock.mockReset();vi.stubGlobal("fetch",fetchMock);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it("keeps Google hidden when server configuration is missing",async()=>{
 fetchMock.mockResolvedValue(Response.json({google:false}));render(<ConfiguredGoogleButton/>);
 await waitFor(()=>expect(fetchMock).toHaveBeenCalledWith("/api/auth/providers",{credentials:"same-origin"}));
 expect(screen.queryByRole("button",{name:"Google ile devam et"})).toBeNull();
});
it("shows Google only when enabled and reports a refused login safely",async()=>{
 fetchMock.mockResolvedValueOnce(Response.json({google:true})).mockResolvedValueOnce(Response.json({message:"private"},{status:503}));
 render(<ConfiguredGoogleButton next="https://evil.test"/>);
 const button=await screen.findByRole("button",{name:"Google ile devam et"});fireEvent.click(button);
 expect((await screen.findByRole("alert")).textContent).toBe("Google ile giriş şu anda kullanılamıyor.");
 expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({provider:"google",callbackURL:"/hesabim"});
});
