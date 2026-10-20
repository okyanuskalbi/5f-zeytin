"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Session } from "@/lib/auth/adapter";
import { getMembershipAdapters } from "@/lib/auth/demo";
import type { AccountOrder, Address } from "@/lib/account/adapter";
import { AddressBook } from "./AddressBook";
import { DemoNotice, Feedback, Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

type State = { phase: "loading" | "guest" | "error" } | { phase: "ready"; profile: Session; addresses: Address[]; orders: AccountOrder[] };

export function Account() {
  const [state, setState] = useState<State>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  const action = useMembershipAction();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { auth, account } = getMembershipAdapters();
        if (!(await auth.getSession())) { if (active) setState({ phase: "guest" }); return; }
        const [profile, addresses, orders] = await Promise.all([account.getProfile(), account.listAddresses(), account.listOrders()]);
        if (active) setState({ phase: "ready", profile, addresses, orders });
      } catch { if (active) setState({ phase: "error" }); }
    }
    void load();
    return () => { active = false; };
  }, [attempt]);

  return <main className={styles.page}><div className={styles.account}>
    <header className={styles.accountHeader}>
      <div><h1>Hesabım</h1><p className={styles.muted}>Profiliniz, adresleriniz ve sofranıza ulaşan lezzetler.</p></div>
      {state.phase === "ready" && <Button variant="outline" disabled={action.busy} onClick={() => void action.run(async () => { await getMembershipAdapters().auth.signOut(); router.replace("/giris"); })}>Çıkış yap</Button>}
    </header>
    <DemoNotice />
    <Feedback {...action.feedback} />
    {state.phase === "loading" && <p role="status">Hesabınız yükleniyor…</p>}
    {state.phase === "error" && <div><p role="alert">Hesap bilgileri yüklenemedi.</p><Button onClick={() => { setState({ phase: "loading" }); setAttempt(attempt + 1); }}>Yeniden dene</Button></div>}
    {state.phase === "guest" && <div className={styles.empty}><p>Hesabınızı görmek için giriş yapın.</p><div className={styles.actions}><Button asChild><Link href="/giris">Giriş yap</Link></Button><Link href="/sepet" className={styles.textLink}>Üye olmadan devam et</Link></div></div>}
    {state.phase === "ready" && <Tabs defaultValue="profile">
      <TabsList aria-label="Hesap bölümleri"><TabsTrigger value="profile">Profil</TabsTrigger><TabsTrigger value="addresses">Adreslerim</TabsTrigger><TabsTrigger value="orders">Siparişlerim</TabsTrigger></TabsList>
      <TabsContent value="profile" className={styles.panel}><Profile profile={state.profile} onChange={profile => setState({ ...state, profile })} /></TabsContent>
      <TabsContent value="addresses" className={styles.panel}><AddressBook initialAddresses={state.addresses} onChange={addresses => setState({ ...state, addresses })} /></TabsContent>
      <TabsContent value="orders" className={styles.panel}><Orders orders={state.orders} /></TabsContent>
    </Tabs>}
  </div></main>;
}

function Profile({ profile, onChange }: { profile: Session; onChange: (profile: Session) => void }) {
  const { busy, feedback, errors, run } = useMembershipAction();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      onChange(await getMembershipAdapters().account.updateProfile({ name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? "") }));
      return "Profil güncellendi. Değişiklik yalnız demo için saklandı.";
    });
  }
  return <section aria-labelledby="profile-title"><h2 id="profile-title">Profil bilgilerim</h2>
    <form className={styles.form} noValidate onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy}>
        <Field id="profile-name" name="name" label="Ad soyad" autoComplete="name" maxLength={100} defaultValue={profile.name} required error={errors.name} />
        <Field id="profile-email" label="E-posta" type="email" autoComplete="email" value={profile.email} readOnly hint="Giriş yaptığınız hesabın e-posta adresi." />
        <Field id="profile-phone" name="phone" label="Telefon" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} defaultValue={profile.phone} error={errors.phone} />
        <Feedback {...feedback} />
        <Button type="submit">{busy ? "Kaydediliyor…" : "Profili kaydet"}</Button>
      </fieldset>
    </form>
  </section>;
}

// Adapted from 21st kavikatiyar/order-history (7710): a semantic sequence
// of dated order states. AFİNA uses flat order rows and explicit demo totals.
function Orders({ orders }: { orders: AccountOrder[] }) {
  return <section aria-labelledby="orders-title"><h2 id="orders-title">Siparişlerim</h2>
    {orders.length === 0 ? <div className={styles.empty}><p>Henüz siparişiniz yok.</p><Button asChild><Link href="/#urunler">Ürünlerimizi keşfedin</Link></Button></div> : <>
      <p className={styles.muted}>Bu listedeki siparişler ve tutarlar örnektir. Gerçek sipariş veya kargo kaydı değildir.</p>
      <ol className={styles.list}>{orders.map(order => <li key={order.no} className={styles.order}>
        <h3>{order.no}</h3>
        <dl>
          <div><dt>Tarih</dt><dd><time dateTime={order.date}>{new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC" }).format(new Date(order.date))}</time></dd></div>
          <div><dt>Tutar</dt><dd>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(order.amountKurus / 100)}</dd></div>
          <div><dt>Durum</dt><dd><span className={styles.badge}>{order.status}</span></dd></div>
        </dl>
        <Button asChild variant="outline"><Link href={`/siparis-takip?no=${encodeURIComponent(order.no)}`}>Takip et</Link></Button>
      </li>)}</ol>
    </>}
  </section>;
}
