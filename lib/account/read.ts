import "server-only";
import { getVerifiedSession } from "@/lib/auth/server";
import type { AccountProfile } from "@/lib/contracts/account";
function displayText(value: unknown,max:number):string|null { return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null; }
export async function readOwnAccount():Promise<AccountProfile|null> {
 const session=await getVerifiedSession();
 return session ? {name:displayText(session.user.name,100),email:displayText(session.user.email,254),phone:displayText(session.user.phone,20)} : null;
}
