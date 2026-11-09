"use client";
import { useEffect, useState } from "react";
import { GoogleButton } from "./GoogleButton";
import { safeAuthRedirect } from "@/lib/auth/config";
export function ConfiguredGoogleButton({ next = "/hesabim" }: { next?: string }) {
  const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[failure,setFailure]=useState("");
  useEffect(() => {
    let active=true;
    void fetch("/api/auth/providers",{ credentials:"same-origin" }).then(r=>r.ok?r.json():null).then(result=>{ if(active) setEnabled(result?.google === true); }).catch(()=>{});
    return ()=>{ active=false; };
  },[]);
  if(!enabled) return null;
  async function signIn() {
    setBusy(true);setFailure("");
    try {
      const response=await fetch("/api/auth/sign-in/social",{ method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:"google",callbackURL:safeAuthRedirect(next)}) });
      const body=await response.json();
      if(!response.ok || typeof body.url!=="string") throw new Error();
      const url=new URL(body.url);
      if(url.protocol!=="https:" || url.hostname!=="accounts.google.com") throw new Error();
      window.location.assign(url.href);
    } catch {setFailure("Google ile giriş şu anda kullanılamıyor.");setBusy(false);}
  }
  return <><GoogleButton busy={busy} onClick={()=>void signIn()}/>{failure && <p role="alert">{failure}</p>}</>;
}
