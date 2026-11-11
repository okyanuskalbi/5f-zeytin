"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PackageIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingTimeline } from "@/components/ui/order-history";
import { customerOrderTimeline } from "@/lib/orders/timeline";
import type { AccountProfile } from "@/lib/contracts/account";
import {
  customerOrderStatuses,
  customerPageSize,
  type CustomerAddress,
  type CustomerOrder,
} from "@/lib/contracts/customer";
import {
  createCustomerAddressAdapter,
  customerJson,
  customerRequest,
} from "@/lib/account/customer-client";
import { CustomerNavigation } from "./CustomerNavigation";
import { AddressBook } from "./AddressBook";
import { Feedback, Field, useMembershipAction } from "./FormControls";
import styles from "@/components/storefront/account/AccountSurface.module.css";

export type CustomerSection =
  | "orders"
  | "addresses"
  | "profile"
  | "security"
  | "order-detail";
const sections = {
  orders: [
    "Siparişlerim",
    "Sipariş durumunuz ve alışveriş geçmişiniz.",
    "siparisler",
  ],
  addresses: [
    "Adreslerim",
    "Teslimat adreslerinizi tek yerden yönetin.",
    "adresler",
  ],
  profile: [
    "Hesap bilgilerim",
    "Size nasıl ulaşacağımızı güncel tutun.",
    "bilgilerim",
  ],
  security: [
    "Güvenlik",
    "Hesabınızın şifresini güvenle güncelleyin.",
    "guvenlik",
  ],
  "order-detail": [
    "Sipariş detayı",
    "Siparişinizin ürün ve teslimat bilgileri.",
    "siparisler",
  ],
} as const;
const money = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    value / 100,
  );
const date = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
  }).format(new Date(value));

function useResource<T>(url: string) {
  const [result, setState] = useState<
    | { url: string; kind: "loading" }
    | { url: string; kind: "error" }
    | { url: string; kind: "ready"; data: T }
  >({ url, kind: "loading" });
  const state = result.url === url ? result : { kind: "loading" as const };
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    void customerRequest<T>(url, { signal: controller.signal })
      .then((data) => {
        if (active) setState({ url, kind: "ready", data });
      })
      .catch(() => {
        if (active) setState({ url, kind: "error" });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [url, attempt]);
  return {
    state,
    retry: () => {
      setState({ url, kind: "loading" });
      setAttempt((value) => value + 1);
    },
  };
}
function ResourceFailure({ retry }: { retry: () => void }) {
  return (
    <div className={styles.empty}>
      <p role="alert">
        Bilgileriniz şu anda yüklenemedi. Lütfen yeniden deneyin.
      </p>
      <Button variant="outline" onClick={retry}>
        Yeniden dene
      </Button>
      <p>
        <Link href="/giris">Giriş sayfasına dön</Link>
      </p>
    </div>
  );
}

export function CustomerWorkspace({
  section,
  profile,
  orderNo,
}: {
  section: CustomerSection;
  profile: AccountProfile;
  orderNo?: string;
}) {
  const [signedOut, setSignedOut] = useState(false);
  const router = useRouter();
  const action = useMembershipAction();
  const [title, description, path] = sections[section];
  return (
    <main className={styles.customerPage}>
      <div className={styles.customerShell}>
        <header className={styles.customerHeader}>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {!signedOut && (
            <Button
              variant="outline"
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  await customerRequest<void>(
                    "/auth/logout",
                    { method: "POST" },
                    204,
                  );
                  setSignedOut(true);
                  router.replace("/giris");
                  router.refresh();
                  return "Oturumunuz kapatıldı.";
                })
              }
            >
              {action.busy ? "İşleniyor…" : "Çıkış yap"}
            </Button>
          )}
        </header>
        {signedOut ? (
          <Link href="/giris">Giriş yap</Link>
        ) : (
          <div className={styles.customerLayout}>
            <CustomerNavigation active={`/hesabim/${path}`} />
            <div className={styles.customerContent} data-customer-section={section}>
              {section === "orders" ? (
                <CustomerOrders />
              ) : section === "addresses" ? (
                <CustomerAddresses />
              ) : section === "profile" ? (
                <ProfileEditor profile={profile} />
              ) : section === "security" ? (
                <SecurityEditor />
              ) : (
                <CustomerOrderDetail no={orderNo ?? ""} />
              )}
            </div>
          </div>
        )}
        <Feedback {...action.feedback} />
      </div>
    </main>
  );
}

function CustomerOrders() {
  const [page, setPage] = useState(1);
  const { state, retry } = useResource<{
    orders: CustomerOrder[];
    page: number;
    total: number;
  }>(`/api/account/orders?page=${page}`);
  return (
    <section className={styles.card} aria-label="Sipariş listesi">
      <h2>Alışveriş geçmişiniz</h2>
      {state.kind === "loading" ? (
        <p role="status">Siparişleriniz yükleniyor…</p>
      ) : state.kind === "error" ? (
        <ResourceFailure retry={retry} />
      ) : state.data.orders.length === 0 ? (
        <div className={styles.empty}>
          <PackageIcon size={32} aria-hidden="true" />
          <h2>
            {page === 1 && state.data.total === 0
              ? "Henüz siparişiniz yok."
              : "Bu sayfada sipariş bulunamadı."}
          </h2>
          <p>Sofranız için seçtiğiniz lezzetleri burada takip edebilirsiniz.</p>
          {page > 1 ? (
            <Button variant="outline" onClick={() => setPage(page - 1)}>
              Önceki sayfaya dön
            </Button>
          ) : (
            <Link href="/#urunler">Ürünlerimizi keşfedin</Link>
          )}
        </div>
      ) : (
        <>
          <ul className={styles.rows}>
            {state.data.orders.map((order) => (
              <li className={styles.orderRow} key={order.no}>
                <div>
                  <h3>{order.no}</h3>
                  <time dateTime={order.date}>{date(order.date)}</time>
                </div>
                <span className={styles.status}>
                  {customerOrderStatuses[order.status]}
                </span>
                <strong>{money(order.totalKurus)}</strong>
                <Link
                  href={`/hesabim/siparisler/${encodeURIComponent(order.no)}`}
                >
                  Siparişi görüntüle
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.formActions}>
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Önceki
            </Button>
            <span>Sayfa {page}</span>
            <Button
              variant="outline"
              disabled={page * customerPageSize >= state.data.total}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

function CustomerOrderDetail({ no }: { no: string }) {
  const { state, retry } = useResource<CustomerOrder>(
    `/api/account/orders/${encodeURIComponent(no)}`,
  );
  const order = state.kind === "ready" ? state.data : null;
  return (
    <div className={styles.details}>
      <Link href="/hesabim/siparisler" className={styles.back}>
        <ArrowLeftIcon size={16} aria-hidden="true" />
        Siparişlerime dön
      </Link>
      <section className={styles.card}>
        <h2>Sipariş bilgileri</h2>
        {state.kind === "loading" ? (
          <p role="status">Siparişiniz yükleniyor…</p>
        ) : state.kind === "error" ? (
          <ResourceFailure retry={retry} />
        ) : order && <>
          <p>{order.no}</p>
          <p>
            <time dateTime={order.date}>{date(order.date)}</time>
          </p>
          <span className={styles.status}>
            {customerOrderStatuses[order.status]}
          </span>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                <span>
                  {item.name}, {item.weight}
                  <br />
                  {item.quantity} adet × {money(item.unitPriceKurus)}
                </span>
                <strong>{money(item.quantity * item.unitPriceKurus)}</strong>
              </li>
            ))}
          </ul>
          <p>
            Genel toplam <strong>{money(order.totalKurus)}</strong>
          </p>
        </>}
      </section>
      {order && <>
        <section className={styles.card} aria-labelledby="customer-order-journey">
          <h2 id="customer-order-journey">Sipariş yolculuğu</h2>
          <TrackingTimeline items={customerOrderTimeline(order)} />
        </section>
        <section className={styles.card}>
          <h2>Teslimat ve kargo</h2>
          <p>{order.deliveryAddress || "Teslimat adresi henüz paylaşılmadı."}</p>
          {order.shipping ? (
            <>
              <p>
                {order.shipping.carrier}, {order.shipping.trackingNo}
              </p>
              {order.shipping.url && (
                <a
                  href={order.shipping.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kargo firmasından takip et
                </a>
              )}
            </>
          ) : (
            <p>Kargo bilgisi henüz paylaşılmadı.</p>
          )}
        </section>
      </>}
    </div>
  );
}

function CustomerAddresses() {
  const { state, retry } = useResource<CustomerAddress[]>(
    "/api/account/addresses",
  );
  const adapter = useMemo(() => createCustomerAddressAdapter(), []);
  return (
    <div className={styles.card}>
      {state.kind === "loading" ? (
        <p role="status">Adresleriniz yükleniyor…</p>
      ) : state.kind === "error" ? (
        <ResourceFailure retry={retry} />
      ) : (
        <AddressBook
          initialAddresses={state.data}
          onChange={() => {}}
          adapter={adapter}
          demo={false}
        />
      )}
    </div>
  );
}

function ProfileEditor({ profile }: { profile: AccountProfile }) {
  const { busy, errors, feedback, run } = useMembershipAction();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void run(async () => {
      await customerRequest("/api/account/profile", {
        method: "PATCH",
        ...customerJson({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
        }),
      });
      router.refresh();
      return "Hesap bilgileriniz güncellendi.";
    });
  }
  return (
    <section className={styles.card}>
      <h2>Size ait bilgiler</h2>
      <form
        onSubmit={submit}
        noValidate
        aria-label="Hesap bilgilerini düzenle"
        aria-busy={busy}
        key={profile.email}
      >
        <fieldset className={styles.fields} disabled={busy}>
          <Field
            id="customer-name"
            name="name"
            label="Ad soyad"
            defaultValue={profile.name ?? ""}
            maxLength={100}
            autoComplete="name"
            required
            error={errors.name}
          />
          <Field
            id="customer-phone"
            name="phone"
            label="Telefon"
            defaultValue={profile.phone ?? ""}
            maxLength={20}
            type="tel"
            autoComplete="tel"
            error={errors.phone}
          />
          <Field
            id="customer-email"
            label="E-posta"
            value={profile.email ?? ""}
            type="email"
            readOnly
            hint="Giriş yaptığınız hesabın e-posta adresi."
          />
        </fieldset>
        <Feedback {...feedback} />
        <div className={styles.formActions}>
          <Button type="submit" disabled={busy}>
            {busy ? "Kaydediliyor…" : "Bilgileri kaydet"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function SecurityEditor() {
  const { busy, errors, feedback, run } = useMembershipAction();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    void run(async () => {
      await customerRequest<void>(
        "/api/account/password",
        {
          method: "POST",
          ...customerJson({
            currentPassword: String(data.get("currentPassword") ?? ""),
            password: String(data.get("password") ?? ""),
          }),
        },
        204,
      );
      form.reset();
      return "Şifreniz güncellendi.";
    });
  }
  return (
    <section className={styles.card}>
      <h2>Şifrenizi değiştirin</h2>
      <p>
        En az 10 karakter, bir büyük harf, bir küçük harf ve bir rakam kullanın.
      </p>
      <form
        onSubmit={submit}
        noValidate
        aria-label="Şifre değiştir"
        aria-busy={busy}
      >
        <fieldset className={styles.fields} disabled={busy}>
          <Field
            id="customer-current-password"
            name="currentPassword"
            label="Mevcut şifre"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
            error={errors.currentPassword}
          />
          <Field
            id="customer-password"
            name="password"
            label="Yeni şifre"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
            error={errors.password}
          />
        </fieldset>
        <Feedback {...feedback} />
        <div className={styles.formActions}>
          <Button type="submit" disabled={busy}>
            {busy ? "Güncelleniyor…" : "Şifreyi güncelle"}
          </Button>
          <Link href="/giris">
            Şifremi unuttum / E-posta bağlantısıyla giriş
          </Link>
        </div>
      </form>
    </section>
  );
}
